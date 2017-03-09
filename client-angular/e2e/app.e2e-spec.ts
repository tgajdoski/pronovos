import { ClientAngularPage } from './app.po';

describe('client-angular App', function() {
  let page: ClientAngularPage;

  beforeEach(() => {
    page = new ClientAngularPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
