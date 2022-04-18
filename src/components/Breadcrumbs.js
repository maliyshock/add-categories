import React, { useCallback, useEffect, useState } from "react";

export default function Breadcrumbs({ selectedCategories, onClick, search }) {
  const [isCollapsed, setIsCollapsed] = useState(window.screen.width < 540);

  const resizeHandler = useCallback(() => {
    setIsCollapsed(window.screen.width < 540);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", () => resizeHandler());

    return window.removeEventListener("resize", () => resizeHandler());
  }, [resizeHandler]);

  const printItem = (item, index) => {
    const element = (
      <li
        onClick={() => onClick(index)}
        className="breadcrumbs__item"
        key={`${item.name}_${index}`}
      >
        <span className="breadcrumbs__content">{item.name}</span>
      </li>
    );

    const toggleCollapse = (
      <li
        onClick={() => setIsCollapsed(false)}
        className="breadcrumbs__item"
        key={`${item.name}_${index}`}
      >
        <span className="breadcrumbs__content">...</span>
      </li>
    );

    if (isCollapsed) {
      if (index === 0 || index === selectedCategories.length - 1) {
        return element;
      } else if (index === selectedCategories.length - 2) {
        return toggleCollapse;
      }
    } else {
      return element;
    }
  };

  return selectedCategories.length > 0 && search === "" ? (
    <ul className="breadcrumbs">{selectedCategories.map(printItem)}</ul>
  ) : (
    <div className="breadcrumbs">{search || "All Categories"}</div>
  );
}
