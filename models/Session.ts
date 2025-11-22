export type Session = {
    _id: string;
    userId: string;
    username: string;
    createdAt: Date;
    expiresAt: Date;
    revoked: boolean;
};
