export class GettingStartedPage {
  constructor(page) {
    this.page = page;
  }

  async fillName(name) {
    await this.page.getByTestId('name').fill(name);
  }

  async fillEmail(email) {
    await this.page.getByTestId('email').fill(email);
  }

  async clickGetStarted() {
    await this.page.getByTestId('get-started').click();
  }

  async fillOTP(otp) {
    await this.page.getByTestId('otp').fill(otp);
  }

  async clickVerifyOTP() {
    await this.page.getByTestId('verify-otp').click();
  }
}
