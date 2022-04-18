import React, { useEffect, useRef } from "react";
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
        active: selectedItems.includes(item.id),
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

function MullerColumn({ data, onClickHandler, selected }) {
  return (
    <div className="miller-columns__column">
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
  );
}

function Breadcrumbs({ selectedCategories, onClick }) {
  return selectedCategories.length > 0 ? (
    <ul className="breadcrumbs">
      {selectedCategories.map((item, index) => (
        <li
          onClick={() => onClick(index)}
          className="breadcrumbs__item"
          key={`${item.name}_${index}`}
        >
          <span className="breadcrumbs__content">{item.name}</span>
        </li>
      ))}
    </ul>
  ) : (
    <div className="breadcrumbs">All Categories</div>
  );
}

export default function MillerColumns({ data }) {
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [columnOffset, setColumnOffset] = useState();
  const [scrollTo, setScrollTo] = useState();
  const categories = getData(data, search);
  const contentRef = useRef();
  const contentOffset = contentRef?.current?.getBoundingClientRect().left;

  useEffect(() => {
    contentRef.current.scrollTo({
      left: scrollTo - contentOffset,
      behavior: "smooth",
    });
  }, [contentOffset, scrollTo]);

  return (
    <div className="miller-columns">
      <div className="miller-columns__search search">
        <Input
          placeholder="Search for categories and sub-categories..."
          onChange={(value) => {
            setSearch(value);
            // this is wrong
            setSelectedCategories([]);
            setSelectedIds([]);
          }}
        />
      </div>

      <Breadcrumbs
        onClick={(index) => {
          setSelectedIds(selectedIds.slice(0, index + 1));
          setSelectedCategories(selectedCategories.slice(0, index + 1));
          contentRef.current.scrollTo({
            left: columnOffset * index - contentOffset,
            behavior: "smooth",
          });
        }}
        selectedCategories={selectedCategories}
      />

      <div ref={contentRef} className="miller-columns__content">
        <MullerColumn
          selected={selectedIds}
          data={categories}
          onClickHandler={(e, item) => {
            setSelectedCategories([item]);
            setSelectedIds([item.id]);
          }}
        />

        {selectedCategories.map((column, index) => (
          <MullerColumn
            key={index}
            selected={selectedIds}
            data={column.children}
            onClickHandler={(e, item) => {
              if (item.children.length > 0) {
                const columnOffset =
                  e.currentTarget.getBoundingClientRect().left;

                console.log("columnOffset", columnOffset);
                setColumnOffset(columnOffset);
                setScrollTo(columnOffset * (index + 1));
              }

              // if there is no id in selected list
              if (!selectedIds.includes(item.id) && item.children.length > 0) {
                const newSelectedCategories = [...selectedCategories];
                const newSelectedIds = [...selectedIds];
                newSelectedCategories[index + 1] = item;
                newSelectedIds[index + 1] = item.id;

                setSelectedCategories(newSelectedCategories);
                setSelectedIds(newSelectedIds);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}
