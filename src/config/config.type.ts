export type AppConfig = {
	host: string;
	port: number;
	ssl_key?: string;
	ssl_cert?: string;
}
export type AllConfigType = {
	app: AppConfig
}