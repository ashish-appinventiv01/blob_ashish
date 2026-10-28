class ObjectIdUtil {
  private readonly pattern = /^[a-fA-F0-9]{24}$/;

  isObjectId(value: string): boolean {
    return this.pattern.test(value);
  }
}

export const objectId = new ObjectIdUtil();
