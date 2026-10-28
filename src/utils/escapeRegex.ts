class RegexUtil {
  escape(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}

export const regexUtil = new RegexUtil();
