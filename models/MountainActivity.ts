export type MountainActivityLink = {
    name: string;
    link: string;
};

export type MountainActivity = {
    _id: string;
    name: string;
    done: boolean;
    note: string;
    mountainGroup: string;
    summitAltitude: number;
    tags: string[];
    links: MountainActivityLink[];
    createdAt: string;
    updatedAt: string;
};

export type CreateMountainActivity = {
    name: string;
    done: boolean;
    note: string;
    mountainGroup: string;
    summitAltitude: number | null;
    tags: string[];
    links: MountainActivityLink[];
};
