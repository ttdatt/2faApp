import './App.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Input } from '@/components/ui/input';
import { DataInterface, OtpItemInterface } from './types';
import { debounce } from 'lodash';
import { BaseDirectory } from '@tauri-apps/api/path';
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
import { open } from '@tauri-apps/plugin-dialog';
import { listen } from '@tauri-apps/api/event';
import { useToast } from '@/hooks/use-toast';
import { getRemainingSeconds, getToken } from './utils/token';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { Label } from './components/ui/label';
import CountdownCircle from './CountdownCircle';
import { Toaster } from './components/ui/toaster';
import { decrypt, encrypt } from './utils/crypto';

const INTERVAL = 0.04;

const ListItem = ({
	x,
	timeLeft,
	trigger,
	onClick,
}: { x: OtpItemInterface; timeLeft: number; trigger: number; onClick?: () => void }) => {
	const { toast } = useToast();
	const [otp, setOtp] = useState<string>(getToken(x.secret));

	useEffect(() => {
		if (trigger >= 0) {
			setOtp(getToken(x.secret));
		}
	}, [trigger, x.secret]);

	return (
		<div
			className='flex items-center justify-between py-1 cursor-pointer pb-2'
			onKeyDown={undefined}
			onClick={async (e) => {
				e.preventDefault();
				onClick?.();
				await writeText(otp);
				toast({ description: otp });
			}}>
			<div className='flex flex-col cursor-pointer'>
				<Label className='text-xl font-normal cursor-pointer'>{x.name}</Label>
				<Label className='text-3xl font-normal cursor-pointer'>{otp}</Label>
				<Label className='text-xl font-normal h-7 cursor-pointer'>{x.otp.account}</Label>
			</div>
			<CountdownCircle timeLeft={timeLeft} />
		</div>
	);
};

const List = ({ items, onClick }: { items: OtpItemInterface[]; onClick?: () => void }) => {
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

	return items?.map((x) => {
		return (
			<ListItem
				onClick={onClick}
				x={x}
				key={x.name + x.otp.account}
				timeLeft={timeLeft}
				trigger={trigger}
			/>
		);
	});
};

function App() {
	const originData = useRef<DataInterface>();
	const [items, setItems] = useState<OtpItemInterface[]>([]);
	const ref = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === '/') {
				e.preventDefault();
				ref.current?.focus();
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, []);

	useEffect(() => {
		(async () => {
			await invoke('write_log', { message: 'load file' });
			const content = await readTextFile('output.bin', {
				baseDir: BaseDirectory.Resource,
			});
			const data = JSON.parse(await decrypt(content));
			originData.current = data;
			setItems(data.services);
			await invoke('write_log', { message: 'load file end' });
		})();
	}, []);

	useEffect(() => {
		const unlisten = listen('open-dialog', async () => {
			const selected = await open({ multiple: false, directory: false });
			if (selected) {
				const content = await readTextFile(selected);
				const data = JSON.parse(content);
				setItems(data.services);
				originData.current = data;

				const compressText = await encrypt(content);
				await writeTextFile('output.bin', compressText, {
					baseDir: BaseDirectory.Resource,
				});
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

	return (
		<div className='flex flex-col pt-4 px-4'>
			<Input
				ref={ref}
				autoFocus
				autoCorrect='off'
				autoComplete='off'
				type='text'
				className='mb-4'
				onChange={onChangeText}
			/>
			<List items={items} />
			<Toaster />
		</div>
	);
}

export default App;
