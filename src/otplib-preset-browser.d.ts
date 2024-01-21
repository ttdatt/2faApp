declare module "@otplib/preset-browser" {
	export const authenticator: {
		generate: (secret: string) => string;
	};
}
