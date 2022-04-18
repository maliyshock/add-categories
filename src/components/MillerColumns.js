import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Input } from "./Input";
import { useState } from "react";
import classnames from "classnames";
import { FiChevronRight } from "react-icons/fi";

function isMatch(string, search) {
  return string.toLowerCase().includes(search.toLowerCase());
}

function getData(data, search) {
  return data.reduce((previousValue, currentValue) => {
    if (isMatch(currentValue.name, search)) {
      return [...previousValue, currentValue];
    } else if (currentValue.children.length > 0) {
      return [...previousValue, ...getData(currentValue.children, search)];
    }

    return previousValue;
  }, []);
}

function sortFunction(a, b) {
  if (a.children.length > 0 && b.children.length) {
    return 0;
  } else if (a.children.length > 0) {
    return -1;
  }
  return 1;
}

function Item({ item, onClickHandler, selectedItems }) {
  const [selected, setSelected] = useState(false);
  return (
    <li
      onClick={(e) => {
        onClickHandler(e, item);
        setSelected(!selected);
      }}
      className={classnames("list__item", {
        active: selectedItems.find((category) => category.id === item.id),
        hasChilds: item.children.length > 0,
      })}
    >
      <div className="list__content">
        {!item.children.length > 0 && (
          <input checked={selected} type="radio" name={item.parentId} />
        )}
        {item.name}
      </div>
      {item.children.length > 0 && <FiChevronRight className="list__icon" />}
    </li>
  );
}

const MullerColumn = React.forwardRef(
  ({ data, onClickHandler, selected }, ref) => (
    <div ref={ref} className="miller-columns__column">
      <ul className="list">
        {data.sort(sortFunction).map((item, index) => (
          <Item
            item={item}
            key={`${item.name}_${index}`}
            onClickHandler={onClickHandler}
            selectedItems={selected}
          />
        ))}
      </ul>
    </div>
  )
);

function Breadcrumbs({ selectedCategories, onClick, search }) {
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

export default function MillerColumns({ data }) {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState();
  const [columnWidth, setColumnWidth] = useState();
  const contentRef = useRef();
  const columnRef = useRef();

  useEffect(() => {
    if (Number.isInteger(lastSelectedIndex) && columnWidth) {
      contentRef.current.scrollTo({
        left: columnWidth * (lastSelectedIndex + 1),
        behavior: "smooth",
      });
    }
  }, [columnWidth, lastSelectedIndex]);

  useEffect(() => {
    let myObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        setColumnWidth(entry.target.getBoundingClientRect().width);
      });
    });
    myObserver.observe(columnRef.current);
    setColumnWidth(columnRef.current.getBoundingClientRect().width);
  }, [columnRef]);

  useEffect(() => {
    setSearchResult(getData(data, search));
  }, [data, search]);

  const renderSearchResult = (
    <div>
      {searchResult.map((item) => {
        return <div></div>;
      })}
    </div>
  );

  return (
    <div className="miller-columns">
      <div className="miller-columns__search search">
        <Input
          placeholder="Search for categories and sub-categories..."
          onChange={(value) => {
            setSearch(value);
          }}
        />
      </div>

      <Breadcrumbs
        onClick={(index) => {
          contentRef.current.scrollTo({
            left: columnWidth * index,
            behavior: "smooth",
          });

          setTimeout(
            () => setSelectedCategories(selectedCategories.slice(0, index + 1)),
            500
          );
        }}
        search={search}
        selectedCategories={selectedCategories}
      />

      {search !== "" ? (
        (searchResult.length > 0 && renderSearchResult) ||
        "No categories found for “XYZ”. Please try searching again. "
      ) : (
        <div ref={contentRef} className="miller-columns__content">
          <MullerColumn
            ref={columnRef}
            selected={selectedCategories}
            data={data}
            onClickHandler={(e, item) => {
              setSelectedCategories([item]);
            }}
          />

          {selectedCategories.map((column, index) => (
            <MullerColumn
              key={index}
              selected={selectedCategories}
              data={column.children}
              onClickHandler={(e, item) => {
                if (item.children.length > 0) {
                  setColumnWidth(columnWidth);
                  if (index !== lastSelectedIndex) {
                    setLastSelectedIndex(index);
                  }
                }

                // if there is no id in selected list
                if (
                  !selectedCategories.find(
                    (category) => category.id === item.id
                  ) &&
                  item.children.length > 0
                ) {
                  const newSelectedCategories = [
                    ...selectedCategories.slice(0, index + 1),
                  ];
                  newSelectedCategories[index + 1] = item;
                  setSelectedCategories(newSelectedCategories);
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
