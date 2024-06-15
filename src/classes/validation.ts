export class Validation {
  inputElement: HTMLInputElement;
  errorElement: HTMLSpanElement;

  constructor(inputElement: HTMLInputElement, errorElement: HTMLSpanElement) {
    this.inputElement = inputElement;
    this.errorElement = errorElement;
  }

  public checkValidation(inputElement: HTMLInputElement): boolean {
    if (inputElement.value.trim() === '') {
      this.showErrorMessage();
      return false
    } else if (inputElement.validity.typeMismatch) {
      this.showErrorMessage();
      return false
    } else if (inputElement.validity.patternMismatch) {
      this.showErrorMessage();
      return false
    } else {
      this.hideErrorMessage();
      return true
    }
  }

  private showErrorMessage() {
    if (this.inputElement.value.trim() === '') {
      this.inputElement.setCustomValidity(this.inputElement.dataset.errorMessage);
      this.errorElement.textContent = this.inputElement.validationMessage;
    } else if (this.inputElement.validity.typeMismatch || this.inputElement.validity.patternMismatch) {
      this.errorElement.textContent = this.inputElement.validationMessage;
    }
  }

  private hideErrorMessage() {
    this.inputElement.setCustomValidity('');
    this.errorElement.textContent = '';
  }
}