export interface Invite {
	userId: string;
	email: string;
	role: string;
}

export interface Document {
	id: string;
	title: string;
	createdAt: string;
	owner: {
		id: string;
		email: string;
	};
}