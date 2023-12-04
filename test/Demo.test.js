/**
 * Funkcionalni testi
 */
(async function Sporocila() {
  // Knjižnice
  const { exec } = require("child_process");
  const { describe, it, after, before } = require("mocha");
  const { Builder, By, until } = require("selenium-webdriver");
  const chrome = require("selenium-webdriver/chrome");
  const expect = require("chai").expect;

  // URL naslov aplikacije, ki jo želimo testirati
  let appUrl = "https://my-fishing-diary.onrender.com";

  // URL naslov Selenium strežnika. V primeru, da uporabljamo Docker v OS Windows je potrebno URL posodobiti iz localhost na dodeljen IP.
  let seleniumServerUrl = "http://localhost:4445/wd/hub";
  let browser, jwtToken;

  const axios = require("axios").create({
    baseURL: appUrl + "api/",
    timeout: 5000,
  });

  // Obvladovanje napak
  process.on("unhandledRejection", (error) => {
    console.log(error);
  });

  // Počakaj določeno število sekund na zahtevani element na strani
  let waitPageLoad = async (browser, timeInS, xpath) => {
    await browser.wait(
      () => {
        return browser.findElements(By.xpath(xpath)).then((elements) => {
          return elements[0];
        });
      },
      timeInS * 1000,
      `The page did not load in ${timeInS} s.`
    );
  };
  let confirmHttpsException = async (browser) => {
    let button = await browser.findElement(
      By.xpath("//button[contains(text(), 'Advanced')]")
    );
    expect(button).to.not.be.empty;
    await button.click();
    let link = await browser.findElement(
      By.xpath("//a[contains(text(), 'Proceed to')]")
    );
    expect(link).to.not.be.empty;
    await link.click();
  };

  try {
    before(() => {
      browser = new Builder()
        .forBrowser("chrome")
        .setChromeOptions(
          new chrome.Options()
            .addArguments("start-maximized")
            .addArguments("disable-infobars")
            .addArguments("allow-insecure-localhost")
            .addArguments("allow-running-insecure-content")
        )
        .usingServer(seleniumServerUrl)
        .build();
    });

    describe("Initial DB data", function () {
      this.timeout(30 * 1000);
      before(() => {
        browser.get(appUrl);
        confirmHttpsException(browser);
      });

      it("Chack if user is signed in", async () => {
        await waitPageLoad(browser, 10, "//span[contains(text(), 'Login')]");
        let prijavaPovezava = await browser.findElement(
          By.xpath("//span[contains(text(), 'Login')]")
        );
        expect(prijavaPovezava).to.not.be.empty;
      });

      it("Fill initial data", async () => {
        let dbStranPovezava = browser.findElement(
          By.xpath("//span[contains(text(), 'DB')]")
        );
        dbStranPovezava.click();
        await waitPageLoad(browser, 10, "//span[contains(text(), 'Fill DB')]");
        await browser
          .findElement(By.xpath("//span[contains(text(), 'Delete DB')]"))
          .click();
        await browser
          .findElement(By.xpath("//span[contains(text(), 'Fill DB')]"))
          .click();
      });
    });

    describe("Login user", function () {
      it("Go to login page", async () => {
        let loginLink = await browser.findElement(
          By.xpath("//span[contains(text(), 'Login')]")
        );
        expect(loginLink).to.not.be.empty;
        await loginLink.click();
      });
      it("user data entry", async () => {
        let email = await browser.findElement(By.css("input"));
        expect(email).to.not.be.empty;
        email.sendKeys("admin@admin.com");
        let password = await browser.findElement(
          By.css("input[type='password']")
        );
        expect(password).to.not.be.empty;
        password.sendKeys("nimda");
        let button = await browser.findElement(
          By.xpath("//div[contains(text(), 'Login')]")
        );
        await email.click();
        await button.click();
      });
      it("check if user is logged in", async () => {
        await waitPageLoad(
          browser,
          10,
          "//i[contains(@class, 'fa-sign-out-alt')]"
        );
        let user = await browser.findElement(
          By.xpath("//span[contains(text(), 'Admin User (admin)')]")
        );
        expect(user).to.not.be.empty;
      });
      it("get JWT token", async () => {
        jwtToken = await browser.executeScript(() =>
          localStorage.getItem("token")
        );
        expect(jwtToken).to.not.be.empty;
      });
    });

    describe("Check trips details", function () {
      it("Is table loaded", async () => {
        let domovPovezava = await browser.findElement(
          By.xpath("//span[contains(text(), 'Trips')]")
        );
        expect(domovPovezava).to.not.be.empty;
        domovPovezava.click();
        await waitPageLoad(
          browser,
          10,
          "//td[contains(text(), 'Carp fishing')]"
        );
        let sporocila = await browser.findElements(By.css(".dx-data-row"));
        expect(sporocila).to.be.an("array").to.have.lengthOf(2);
      });
      context("accuracy of data on the trips page", () => {
        it("table title", async () => {
          let title = await browser.findElement(
            By.css(".dx-datagrid-header-panel .dx-item-content > div")
          );
          expect(title).to.not.be.empty;
          expect(await title.getText()).to.be.equal("Trips");
        });
        it("first trip name", async () => {
          let text = await browser.findElement(
            By.xpath("//td[contains(text(), 'Carp fishing on lake Bled')]")
          );
          expect(text).to.not.be.empty;
        });
        it("second trip name", async () => {
          let text = await browser.findElement(
            By.xpath("//td[contains(text(), 'Carp fishing on lake Boštanj')]")
          );
          expect(text).to.not.be.empty;
        });
      });
    });

    describe("Check trips number", function () {
      it("Number of trips in table", async () => {
        let domovPovezava = await browser.findElement(
          By.xpath("//span[contains(text(), 'Trips')]")
        );
        expect(domovPovezava).to.not.be.empty;
        domovPovezava.click();
        await waitPageLoad(browser, 10, "//tbody");
        let sporocila = await browser.findElements(By.css(".dx-data-row"));
        expect(sporocila).to.be.an("array").to.have.lengthOf(2);
      });
      context("accuracy of data on the trips page", () => {
        it("table title", async () => {
          let title = await browser.findElement(
            By.css(".dx-datagrid-header-panel .dx-item-content > div")
          );
          expect(title).to.not.be.empty;
          expect(await title.getText()).to.be.equal("Trips");
        });
        it("first trip name", async () => {
          let text = await browser.findElement(
            By.xpath("//td[contains(text(), 'Carp fishing on lake Bled')]")
          );
          expect(text).to.not.be.empty;
        });
        it("second trip name", async () => {
          let text = await browser.findElement(
            By.xpath("//td[contains(text(), 'Carp fishing on lake Boštanj')]")
          );
          expect(text).to.not.be.empty;
        });
      });
    });
    describe("trip page", function () {
      it("go to trip page", async () => {
        let tripLink = await browser.findElement(
          By.xpath("//div[contains(@class, 'fa-external-link-alt')]")
        );
        expect(tripLink).to.not.be.empty;
        await tripLink.click();
        await waitPageLoad(browser, 10, "//h4[contains(text(), 'Details')]");
        context("accuracy of data on the trip details", () => {
          it("trip name", async () => {
            let name = await browser.findElement(
              By.xpath("//p[contains(text(), 'Carp fishing on lake Bled')]")
            );
            expect(name).to.not.be.empty;
          });
          it("trip type", async () => {
            let type = await browser.findElement(
              By.xpath("//p[contains(text(), 'Carp fishing')]")
            );
            expect(type).to.not.be.empty;
          });
          it("trip fisherman", async () => {
            let fisherman = await browser.findElement(
              By.xpath("//p[contains(text(), 'admin@admin.com')]")
            );
            expect(fisherman).to.not.be.empty;
          });
          it("trip date", async () => {
            let date = await browser.findElement(
              By.xpath("//p[contains(text(), 'Oct 19, 2023')]")
            );
            expect(date).to.not.be.empty;
          });
          it("trip description", async () => {
            let description = await browser.findElement(
              By.xpath(
                "//p[contains(text(), 'Catching big carp on a chilli october morning.')]"
              )
            );
            expect(description).to.not.be.empty;
          });
        });
        context("edit trip name", () => {
          it("open edit form", async () => {
            let editButton = await browser.findElement(
              By.xpath("//i[contains(@class, 'fa-edit')]")
            );
            expect(editButton).to.not.be.empty;
            await editButton.click();
            await waitPageLoad(
              browser,
              10,
              "//div[contains(text(), 'Add a trip')]"
            );
          });
          it("edit trip name", async () => {
            let tripNameInput = await browser.findElement(By.xpath("//input"));
            expect(tripNameInput).to.not.be.empty;
            tripNameInput.sendKeys(" - Edited");
            let saveButton = await browser.findElement(
              By.xpath("//span[contains(text(), 'Save')]")
            );
            expect(saveButton).to.not.be.empty;
            await saveButton.click();
            await waitPageLoad(
              browser,
              10,
              "//p[contains(text(), 'Carp fishing on lake Bled - Edited')]"
            );
          });
          it("open edit form", async () => {
            let editButton = await browser.findElement(
              By.xpath("//i[contains(@class, 'fa-edit')]")
            );
            expect(editButton).to.not.be.empty;
            await editButton.click();
            await waitPageLoad(
              browser,
              10,
              "//div[contains(text(), 'Add a trip')]"
            );
          });
          it("edit trip name - back", async () => {
            let tripNameInput = await browser.findElement(By.xpath("//input"));
            expect(tripNameInput).to.not.be.empty;
            await tripNameInput.clear();
            await tripNameInput.sendKeys("Carp fishing on lake Bled");
            let title = await browser.findElement(
              By.xpath("//div[contains(text(), 'Add a trip')]")
            );
            expect(title).to.not.be.empty;
            await title.click();
            let saveButton = await browser.findElement(
              By.xpath("//span[contains(text(), 'Save')]")
            );
            expect(saveButton).to.not.be.empty;
            await saveButton.click();
            await waitPageLoad(
              browser,
              10,
              "//p[contains(text(), 'Carp fishing on lake Bled')]"
            );
          });
        });
        context("add and remove comment", () => {
          it("open add comment form", async () => {
            let addCommentButton = await browser.findElement(
              By.css("dx-button[title='Add Comment'] div")
            );
            expect(addCommentButton).to.not.be.empty;
            await addCommentButton.click();
            await waitPageLoad(
              browser,
              10,
              "//div[contains(text(), 'Add a comment')]"
            );
          });
          it("write comment", async () => {
            let commentTextArea = await browser.findElement(By.css("textarea"));
            expect(commentTextArea).to.not.be.empty;
            await commentTextArea.sendKeys("Test comment");
            let title = await browser.findElement(
              By.xpath("//div[contains(text(), 'Add a comment')]")
            );
            expect(title).to.not.be.empty;
            await title.click();
            let addCommentButton = await browser.findElement(
              By.xpath("//span[contains(text(), 'Save')]")
            );
            expect(addCommentButton).to.not.be.empty;
            await addCommentButton.click();
            await waitPageLoad(
              browser,
              10,
              "//div[contains(text(), 'Test comment')]"
            );
          });
          it("delete comment", async () => {
            let deleteCommentButton = await browser.findElement(
              By.css(".ms-1 i.fa-trash")
            );
            expect(deleteCommentButton).to.not.be.empty;
            await deleteCommentButton.click();
            await waitPageLoad(
              browser,
              10,
              "//div[contains(text(), 'Delete a comment')]"
            );
            let yesButton = await browser.findElement(
              By.xpath("//span[contains(text(), 'Yes')]")
            );
            expect(yesButton).to.not.be.empty;
            await yesButton.click();
            await waitPageLoad(
              browser,
              10,
              "//i[contains(@class, 'fa-sign-out-alt')]"
            );
          });
        });
      });
    });

    after(async () => {
      browser.quit();
    });
  } catch (napaka) {
    console.log("Med testom je prišlo do napake!");
  }
})();
