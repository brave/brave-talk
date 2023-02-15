import { useBrowserProperties, useSubscribedStatus } from "../hooks";
import { Background } from "./Background";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { JoinCallSection } from "./JoinCallSection";
import { SubscriptionCTA } from "./SubscriptionCTA";

export const WelcomeScreen: React.FC = () => {
  const browserProps = useBrowserProperties();
  const subscribed = "yes"; //useSubscribedStatus();

  return (
    <Background>
      <Header subscribed={subscribed} />
      <div css={{ flexGrow: 1 }}>
        <JoinCallSection subscribed={subscribed} browser={browserProps} />

        {/* TODO */}
        <div className="section recordings" id="recordings"></div>

        <SubscriptionCTA subscribed={subscribed} />
      </div>
      <Footer />
    </Background>
  );
};
