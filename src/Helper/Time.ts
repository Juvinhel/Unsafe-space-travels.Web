type Time = number; // time in seconds

function timeToReadableString(time: Time, includeSeconds?: boolean): string
{
    const seconds = Math.trunc(time % 60);
    const minutes = Math.trunc(time / 60 % 60);
    const hours = Math.trunc(time / 60 / 60);

    return hours.toString().padLeft("0", 2) + ":" + minutes.toString().padLeft("0", 2) + (includeSeconds ? "." + seconds.toString().padLeft("0", 2) : "");
}

function dateToReadableString(date: Date): string
{
    if (!date) return "00.00.0000";
    return date.toLocaleDateString("de", { year: "numeric", month: "2-digit", day: "2-digit" });
}

function dateTimeToReadableString(date: Date | string): string
{
    if (typeof date === "string") date = new Date(date);
    if (!date) return "null";
    return date.getDate().toString().padLeft("0", 2) + "." +
        (date.getMonth() + 1).toString().padLeft("0", 2) + "." +
        date.getFullYear().toString().padLeft("0", 4) + " " +
        date.getHours().toString().padLeft("0", 2) + ":" +
        date.getMinutes().toString().padLeft("0", 2);
}