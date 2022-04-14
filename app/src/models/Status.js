export class Status {
  constructor() {
    this._type = "";
    this._message = "";
    this._isActive = false;
  }

  get isActive() {
    return this._isActive;
  }

  get type() {
    return this._type;
  }

  get message() {
    return this._message;
  }

  set setIsActive(isActive) {
    this._isActive = isActive;
  }

  set setType(type) {
    this._type = type;
  }

  set setMessage(message) {
    this._message = message;
  }

  activate(type, message) {
    this._isActive = true;
    this._message = message;
    this._type = type;
  }
  deactivate() {
    this._isActive = false;
  }
}
