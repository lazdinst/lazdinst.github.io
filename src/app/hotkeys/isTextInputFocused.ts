export function isTextInputFocused(): boolean {
  const element = document.activeElement;
  if (!(element instanceof HTMLElement)) {
    return false;
  }
  if (element.isContentEditable) {
    return true;
  }
  const tag = element.tagName;
  if (tag === "TEXTAREA" || tag === "SELECT") {
    return true;
  }
  if (tag !== "INPUT") {
    return false;
  }
  const type = element.getAttribute("type") ?? "text";
  return type !== "button" && type !== "submit" && type !== "reset" && type !== "checkbox";
}
