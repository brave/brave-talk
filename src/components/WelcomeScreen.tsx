import { Background } from "./Background";
import { JoinCallSection } from "./JoinCallSection";

export const WelcomeScreen: React.FC = () => {
  return (
    <Background>
      <div css={{ padding: "0 12px 0" }}>
        <JoinCallSection />
        <div className="section recordings" id="recordings"></div>

        <div id="enter_1on1_button"></div>
      </div>
    </Background>
  );
};
