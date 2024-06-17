export class FormValidation {
  form: HTMLFormElement;
  inputElements: HTMLInputElement[];
  submitButton: HTMLButtonElement;
  errorElement: HTMLSpanElement;

  constructor(form: HTMLFormElement) {
    this.form = form;
    this.inputElements = Array.from(this.form.querySelectorAll('.form__input'));
    this.submitButton = this.form.querySelector('.form__button') as HTMLButtonElement;
  }

  private showErrorMessage(input: HTMLInputElement) {
    this.errorElement.textContent = input.validationMessage;
  }

  private hideErrorMessage() {
    this.errorElement.textContent = '';
  }

  private disableButton() {
    this.submitButton.setAttribute('disabled', 'true');
  }

  private enableButton() {
    this.submitButton.removeAttribute('disabled');
  }

  private isFormValid() {
    return this.inputElements.every(input => input.validity.valid);
  }

  public checkInputValidity(input: HTMLInputElement): boolean {
    this.errorElement = this.form.querySelector(`.${input.name}-input_error-message`) as HTMLSpanElement;
    if (input.value.trim() === '') {
      input.setCustomValidity(input.dataset.errorMessage);
      this.showErrorMessage(input);
      this.disableButton();
      return false
    } else if (input.validity.typeMismatch) {
      this.showErrorMessage(input);
      this.disableButton();
      return false
    } else if (input.validity.patternMismatch) {
      this.showErrorMessage(input);
      this.disableButton();
      return false
    } else {
      input.setCustomValidity('');
      this.hideErrorMessage();

      if (this.isFormValid()) {
        this.enableButton();
      }

      return true
    }
  }  
}