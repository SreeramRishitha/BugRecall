import "./HypothesisCard.css";
import type { Hypothesis } from "../types";
import StatusPill from "./StatusPill";

interface Props {
  hypothesis: Hypothesis;
}

export default function HypothesisCard({ hypothesis }: Props) {
  return (
    <div className="hyp-card">

      <div className="hyp-header">

        <div>

          <div className="hyp-title">
            💡 {hypothesis.title}
          </div>

          <div className="hyp-status">
            <StatusPill status={hypothesis.status} />
          </div>

        </div>

      </div>

      {hypothesis.reason && (

        <>

          <div className="divider"></div>

          <div className="reason-title">
            Reason
          </div>

          <div className="reason">
            {hypothesis.reason}
          </div>

        </>

      )}

      <div className="divider"></div>

      <div className="footer">

        ✔ Investigation Updated

      </div>

    </div>
  );
}