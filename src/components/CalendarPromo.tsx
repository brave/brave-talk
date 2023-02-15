export const CalendarPromo: React.FC = () => {
  return (
    <div className="extension-promo" id="extension_promo">
      <div className="body">
        <div
          className="title-text i18n-element-text"
          id="extension_promo_title_text"
        >
          Now you can schedule ahead!
        </div>

        <div
          className="body-text i18n-element-text"
          id="extension_promo_body_text"
        >
          Add Brave Talk links directly to an invite, with the Google Calendar
          extension.
        </div>

        <a
          href="https://chrome.google.com/webstore/detail/brave-talk-for-google-cal/nimfmkdcckklbkhjjkmbjfcpaiifgamg"
          rel="nofollow noreferrer noopener"
          target="_blank"
        >
          <button>
            <div className="i18n-element-text" id="extension_promo_install">
              Install Calendar extension
            </div>
          </button>
        </a>
      </div>
      <div className="extension-close" id="extension_promo_close"></div>
    </div>
  );
};
