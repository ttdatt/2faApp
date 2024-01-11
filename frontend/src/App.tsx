import { useCallback, useEffect, useRef, useState } from "react";
import { CopyToClipboard, ImportFile, LoadFile } from "../wailsjs/go/main/App";
import CountdownCircle from "./CountdownCircle";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { DataInterface, OtpItemInterface } from "./types";
import { getToken } from "./utils";
import debounce from "lodash/debounce";
import { compressToUTF16, decompressFromUTF16 } from "lz-string";

const ListItem = ({ x }: { x: OtpItemInterface }) => {
	const { toast } = useToast();
	const [otp, setOtp] = useState<string>(getToken(x.secret));

	const refreshOtp = useCallback(() => {
		setOtp(getToken(x.secret));
	}, [x.secret]);

	return (
		<div
			className="flex items-center justify-between py-1 cursor-pointer pb-2"
			onKeyDown={undefined}
			onClick={async () => {
				const success = await CopyToClipboard(otp);
				if (success) toast({ description: otp });
			}}
		>
			<div className="flex flex-col cursor-pointer">
				<Label className="text-xl font-normal">{x.name}</Label>
				<Label className="text-3xl font-normal">{otp}</Label>
				<Label className="text-xl font-normal h-7">{x.otp.account}</Label>
			</div>
			<CountdownCircle onFinishStep={refreshOtp} />
		</div>
	);
};

function App() {
	const originData = useRef<DataInterface>();
	const [items, setItems] = useState<OtpItemInterface[]>([]);
	const inputFile = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		window.runtime.EventsOn("open-file", (data: any) => {
			console.log(data);
			inputFile.current?.click();
		});

		return () => {
			window.runtime.EventsOff("open-file");
		};
	}, []);

	useEffect(() => {
		(async () => {
			const content = await LoadFile();
			const data = JSON.parse(decompressFromUTF16(content));
			originData.current = data;
			setItems(data.services);
		})();
	}, []);

	const onOpenFile = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			if (!event.target.files?.[0]) return;

			const reader = new FileReader();
			reader.onload = async (e) => {
				if (e.target?.result) {
					const content = e.target.result as string;
					const data = JSON.parse(content);
					setItems(data.services);
					originData.current = data;

					const compressText = compressToUTF16(content);
					await ImportFile(compressText);

					if (inputFile.current) inputFile.current.value = "";
				}
			};
			reader.readAsText(event.target.files[0]);
		},
		[],
	);

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

	return (
		<div className="flex flex-col pt-4 px-4">
			<input
				type="file"
				id="file"
				ref={inputFile}
				style={{ display: "none" }}
				onChange={onOpenFile}
			/>
			<Input
				autoFocus
				autoCorrect="off"
				autoComplete="off"
				type="text"
				className="mb-4"
				onChange={onChangeText}
			/>

			{items?.map((x) => {
				return <ListItem x={x} key={x.name + x.otp.account} />;
			})}
			<Toaster />
		</div>
	);
}

export default App;
