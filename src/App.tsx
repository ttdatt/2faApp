import { useCallback, useEffect, useRef, useState } from "react";
import CountdownCircle from "./CountdownCircle";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import type { DataInterface, OtpItemInterface } from "./types";
import { getRemainingSeconds, getToken } from "./utils";
import debounce from "lodash/debounce";
import { compressToUTF16, decompressFromUTF16 } from "lz-string";
import { invoke } from "@tauri-apps/api";
import { readTextFile, writeTextFile } from "@tauri-apps/api/fs";
import { resourceDir } from "@tauri-apps/api/path";
import { listen } from "@tauri-apps/api/event";
import { open } from "@tauri-apps/api/dialog";
import { writeText } from "@tauri-apps/api/clipboard";

const INTERVAL = 0.04;

const ListItem = ({
  x,
  timeLeft,
  trigger,
}: { x: OtpItemInterface; timeLeft: number; trigger: number }) => {
  const { toast } = useToast();
  const [otp, setOtp] = useState<string>(getToken(x.secret));

  useEffect(() => {
    if (trigger < 0) {
    }
    setOtp(getToken(x.secret));
  }, [trigger, x.secret]);

  return (
    <div
      className="flex items-center justify-between py-1 cursor-pointer pb-2"
      onKeyDown={undefined}
      onClick={async () => {
        await writeText(otp);
        toast({ description: otp });
      }}
    >
      <div className="flex flex-col cursor-pointer">
        <Label className="text-xl font-normal cursor-pointer">{x.name}</Label>
        <Label className="text-3xl font-normal cursor-pointer">{otp}</Label>
        <Label className="text-xl font-normal h-7 cursor-pointer">
          {x.otp.account}
        </Label>
      </div>
      <CountdownCircle timeLeft={timeLeft} />
    </div>
  );
};

const List = ({ items }: { items: OtpItemInterface[] }) => {
  const [trigger, setTrigger] = useState(0);
  const [timeLeft, setTimeLeft] = useState(getRemainingSeconds());
  const flag = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const t = getRemainingSeconds();

      if (t >= 29 && !flag.current) {
        flag.current = true;
        setTrigger((x) => x + 1);
      }
      if (t < 2) {
        flag.current = false;
      }
      setTimeLeft(t);
    }, INTERVAL * 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {items?.map((x) => {
        return (
          <ListItem
            x={x}
            key={x.name + x.otp.account}
            timeLeft={timeLeft}
            trigger={trigger}
          />
        );
      })}
    </>
  );
};

function App() {
  const originData = useRef<DataInterface>();
  const [items, setItems] = useState<OtpItemInterface[]>([]);

  useEffect(() => {
    (async () => {
      await invoke("write_log", { message: "load file" });
      const dir = await resourceDir();
      const content = await readTextFile(`${dir}output.bin`);
      const data = JSON.parse(decompressFromUTF16(content));
      originData.current = data;
      setItems(data.services);
      await invoke("write_log", { message: "load file end" });
    })();
  }, []);

  useEffect(() => {
    const unlisten = listen("open-dialog", async () => {
      const selected = await open();
      if (selected) {
        const content = await readTextFile(selected as string);
        const data = JSON.parse(content);
        setItems(data.services);
        originData.current = data;

        const compressText = compressToUTF16(content);
        const dir = await resourceDir();
        await writeTextFile(`${dir}output.bin`, compressText);
      }
    });
    return () => {
      unlisten.then((f) => f());
    };
  }, []);

  const onChangeText = useCallback(
    debounce((e: React.ChangeEvent<HTMLInputElement>) => {
      const text = e.target.value;

      if (!originData.current) return;

      if (text?.length > 0) {
        setItems(
          originData.current?.services?.filter(
            (y) =>
              y.name.toLowerCase().includes(text.toLowerCase()) ||
              y.otp.account?.toLowerCase().includes(text.toLowerCase()),
          ),
        );
      } else setItems(originData.current?.services);
    }, 300),
    [],
  );

  invoke("write_log", { message: "render" });

  return (
    <div className="flex flex-col pt-4 px-4">
      <Input
        autoFocus
        autoCorrect="off"
        autoComplete="off"
        type="text"
        className="mb-4"
        onChange={onChangeText}
      />
      <List items={items} />
      <Toaster />
    </div>
  );
}

export default App;
