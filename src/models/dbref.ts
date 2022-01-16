export type dbref = number & { __flavor?: "dbref" };

let highestId = 0;

export const ID = {
  get: () => {
    highestId = highestId + 1;
    return highestId;
  },
};

export function isDbRef(id: any): id is dbref {
  return id?.__flavor === "dbref" && typeof id === "number";
}
