export const SubscriptionCTA: React.FC = () => {
  const _loading = (
    <div className="section subscribe subscribe-loading" id="subscribe_loading">
      <div className="spinner"></div>
      <div className="i18n-element-text" id="check_subscription">
        Checking subscription status...
      </div>
    </div>
  );

  return (
    <div className="section subscribe" id="subscribe">
      <p className="subscribe-text i18n-element-text" id="subscribe_text">
        Upgrade to host video calls with hundreds of participants.
      </p>
      <button className="welcome-page-button-hollow" id="subscribe_button">
        <div className="i18n-element-text" id="welcome_page_button_hollow">
          Start free trial
        </div>
      </button>
      <div
        className="subscribe-login i18n-element-text"
        id="subscribe_login_text"
      >
        Get 30 days of access to Brave Talk Premium, free of charge. After 30
        days, the credit card you enter will be charged $7.00 US monthly. You
        can cancel any time.
      </div>
      <div className="subscribe-login">
        <span className="i18n-element-text" id="subscribe_login_premium">
          Already have Premium?
        </span>
        <a
          href="https://account.brave.com"
          className="i18n-element-text"
          id="subscribe_login_link"
        >
          Log in
        </a>
        .
      </div>
    </div>
  );
};
