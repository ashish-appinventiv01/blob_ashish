export interface PublicUser {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateNameInput {
  userId: string;
  name: string;
}
