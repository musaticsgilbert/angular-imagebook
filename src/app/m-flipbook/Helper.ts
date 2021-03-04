export class Helper {
  public static coerceNumberProperty(value: any, fallbackValue = 0) {
    return Helper._isNumberValue(value) ? Number(value) : fallbackValue;
  }

  public static _isNumberValue(value: any): boolean {
    // parseFloat(value) handles most of the cases we're interested in (it treats null, empty string,
    // and other non-number values as NaN, where Number just uses 0) but it considers the string
    // '123hello' to be a valid number. Therefore we also check if Number(value) is NaN.
    return !isNaN(parseFloat(value as any)) && !isNaN(Number(value));
  }
}