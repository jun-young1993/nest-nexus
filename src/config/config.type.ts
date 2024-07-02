export type AppConfig = {
	host: string;
	port: number;
	ssl_key?: string;
	ssl_cert?: string;
}
export type AlieConfig = {
	url: string
	auth_callback_url: string,
	app_key: string
}
export type AllConfigType = {
	app: AppConfig
	alie: AlieConfig
}