export const getDevice = (DeviceList: any, field: string, argument: string | number) => {
    const method = `get${field.charAt(0).toUpperCase()}${field.slice(1)}`
    return DeviceList.find((device: any) => device[method]() === argument);
}