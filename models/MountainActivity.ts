export type MountainActivityLink = {
    name: string;
    link: string;
};

export type MountainActivity = {
    _id: string;
    name: string;
    done: boolean;
    note: string;
    tags: string[];
    links: MountainActivityLink[];
    createdAt: string;
    updatedAt: string;
};

export type CreateMountainActivity = {
    name: string;
    done: boolean;
    note: string;
    tags: string[];
    links: MountainActivityLink[];
};
