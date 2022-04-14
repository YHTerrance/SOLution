// Copy destination link to clipboard
const copyToClipboard = (text) => {
  var dummy = document.createElement("textarea");
  // to avoid breaking orgain page when copying more words
  // cant copy when adding below this code
  // dummy.style.display = 'none'
  document.body.appendChild(dummy);
  //Be careful if you use texarea. setAttribute('value', value), which works with "input" does not work with "textarea". – Eduard
  dummy.value = text;
  dummy.select();
  document.execCommand("copy");
  document.body.removeChild(dummy);
};

export const copyUrl = (path) => {
  try {
    copyToClipboard(`${window.location.origin}/${path}`);
    return [0, "Copied to clipboard!"];
  } catch {
    return [1, "Copied failed"];
  }
};
