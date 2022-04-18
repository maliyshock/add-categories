import { FiX } from "react-icons/fi";

export default function Layout({ children }) {
  return (
    <div className="sidebar">
      <div className="sidebar__inner">
        <div className="sidebar__header">
          <h2>Add Primary Category</h2>
          <FiX />
        </div>
        <div className="sidebar__body">{children}</div>

        <div className="sidebar__footer">
          <button className="button button--hollow">Cancel</button>
          <button disabled className="button button--fill">
            Select
          </button>
        </div>
      </div>
    </div>
  );
}
