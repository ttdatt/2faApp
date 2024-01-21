import { authenticator } from "@otplib/preset-browser";

export const TIME_FRAME = 30;

export const getToken = (secret: string) => {
	const token = authenticator.generate(secret);
	return token;
};

export const getRemainingSeconds = () => {
	return TIME_FRAME - ((new Date().getTime() / 1000) % TIME_FRAME);
};
