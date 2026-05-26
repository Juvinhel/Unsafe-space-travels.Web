window.onerror = function (msg, url, line, col, error)
{
    // Note that col & error are new to the HTML 5 spec and may not be 
    // supported in every browser.  It worked for me in Chrome.
    var extra = !col ? '' : '\ncolumn: ' + col;
    extra += !error ? '' : '\nerror: ' + error;

    // You can view the information in an alert to see things working like this:
    const errorName = error?.constructor?.name ?? "Error";
    alert(errorName + ": " + msg + "\nurl: " + url + "\nline: " + line + extra);
    console.error(errorName + ": " + msg, url, line, col, error);

    var suppressErrorAlert = true;
    // If you return true, then error alerts (like in older versions of 
    // Internet Explorer) will be suppressed.
    return suppressErrorAlert;
};