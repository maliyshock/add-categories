import React, { useEffect, useRef } from "react";
import { Input } from "./Input";
import { useState } from "react";
import classnames from "classnames";
import { FiChevronRight } from "react-icons/fi";
import Breadcrumbs from "./Breadcrumbs";

function isMatch(string, search) {
  return string.toLowerCase().includes(search.toLowerCase());
}

// TODO: different data structure with arrays might be better to print separate lists
function getChildren(item) {
  if (item.children.length > 0) {
    return item.children.reduce((previousValue, currentValue) => {
      return currentValue.children.length > 0
        ? [...previousValue, ...getChildren(currentValue)]
        : [...previousValue, currentValue];
    }, []);
  } else {
    return item;
  }
}

function getData(data, search) {
  return data.reduce((previousValue, currentValue) => {
    if (isMatch(currentValue.name, search)) {
      const children = getChildren(currentValue);
      return [
        ...previousValue,
        ...(Array.isArray(children) ? children : [children]),
      ];
    } else if (currentValue.children.length > 0) {
      return [...previousValue, ...getData(currentValue.children, search)];
    }

    return previousValue;
  }, []);
}

function sortByType(a, b) {
  if (a.children.length > 0 && b.children.length) {
    return 0;
  } else if (a.children.length > 0) {
    return -1;
  }
  return 1;
}
function sortByGroup(a, b) {
  if (a.path.slice(0, -1).join("") === b.path.slice(0, -1).join("")) {
    return 1;
  } else {
    return -1;
  }
}

function Item({ item, onClickHandler, selectedItems, radio }) {
  return (
    <li
      onClick={(e) => onClickHandler(e, item)}
      className={classnames("list__item", {
        active:
          radio && item.children.length === 0
            ? item.path.join() === radio
            : selectedItems.find((category) => category.id === item.id),
        hasChilds: item.children.length > 0,
      })}
    >
      <div className="list__name">
        {!item.children.length > 0 && (
          <input readOnly checked={item.path.join() === radio} type="radio" />
        )}
        {item.name}
      </div>
      {item.children.length > 0 && <FiChevronRight className="list__icon" />}
    </li>
  );
}

const MullerColumn = React.forwardRef(
  ({ data, onClickHandler, selected, groups, className, radio }, ref) => {
    let groupsInUse = [];

    return (
      <div
        ref={ref}
        className={classnames("miller-columns__column", className)}
      >
        <ul className="list">
          {data.sort(groups ? sortByGroup : sortByType).map((item, index) => {
            const groupName = item.path.slice(0, -1).join(" > ");
            let groupRender;

            if (!groupsInUse.includes(groupName)) {
              groupsInUse.push(groupName);
              groupRender = <div className="list__group">{groupName}</div>;
            }

            if (groups) {
              return (
                <li key={`${item.name}_${index}`}>
                  {groups && groupRender}
                  <Item
                    radio={radio}
                    item={item}
                    onClickHandler={onClickHandler}
                    selectedItems={selected}
                  />
                </li>
              );
            }

            return (
              <Item
                radio={radio}
                item={item}
                key={`${item.name}_${index}`}
                onClickHandler={onClickHandler}
                selectedItems={selected}
              />
            );
          })}
        </ul>
      </div>
    );
  }
);

export default function MillerColumns({ data }) {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState();
  const [columnWidth, setColumnWidth] = useState();
  const [radio, setRadio] = useState();
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
    if (columnRef.current) {
      myObserver.observe(columnRef.current);
      setColumnWidth(columnRef.current.getBoundingClientRect().width);
    }
  }, []);

  useEffect(() => {
    if (search !== "") {
      setSearchResult(getData(data, search));
    }
  }, [data, search]);

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
      <div
        ref={contentRef}
        className={classnames("miller-columns__content", {
          noBorder: search !== "",
        })}
      >
        {search !== "" ? (
          (searchResult.length > 0 && (
            <MullerColumn
              className="miller-columns__column--block"
              ref={columnRef}
              selected={selectedCategories}
              data={searchResult}
              groups
              radio={radio}
              onClickHandler={(e, item) => {
                setRadio(item.path.join());
              }}
            />
          )) ||
          "No categories found for “XYZ”. Please try searching again. "
        ) : (
          <>
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
                radio={radio}
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
                  setRadio(item.path.join());

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
          </>
        )}
      </div>
    </div>
  );
}
