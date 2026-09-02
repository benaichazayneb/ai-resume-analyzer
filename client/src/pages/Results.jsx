import { useParams } from "react-router-dom";
import PageStub from "../components/PageStub";

export default function Results() {
  const { id } = useParams();

  return (
    <PageStub
      title="Analysis results"
      description={`Detailed results for analysis ${id} will appear here.`}
      phaseNote="Built out alongside the Dashboard in Phase 12."
    />
  );
}
