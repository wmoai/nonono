import { FC } from "react";
import { NonogramEditor } from "../play/NonogramEditor";

const EditPage: FC = () => {
  return (
    <div className="flex justify-center my-8">
      <NonogramEditor />
    </div>
  );
};

export default EditPage;
