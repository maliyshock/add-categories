import { Input, Search } from "./Input";
import { useState } from "react";

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

function MullerColumn({ data, onClickhandler }) {
  return (
    <div className="miller-columns__column">
      <ul className="list">
        {data.map((item) => (
          <li onClick={() => onClickhandler(item)} className="list__item">
            {item.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function MillerColumns({ data }) {
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  const categories = getData(data, search);
  // console.log(
  //   "getData(categories, selectedCategory)",
  //   getData(categories, selectedCategory)
  // );

  console.log("selectedCategories", selectedCategories);
  console.log("selectedIds", selectedIds);

  return (
    <div className="miller-columns">
      <div className="miller-columns__search">
        <Input onChange={(value) => setSearch(value)} />
      </div>

      <div className="miller-columns__content">
        <MullerColumn
          data={categories}
          onClickhandler={(item) => {
            setSelectedCategories([item]);
            setSelectedIds([item.id]);
          }}
        />

        {selectedCategories.map((column, index) => (
          <MullerColumn
            data={column.children}
            onClickhandler={(item) => {
              if (!selectedIds.includes(item.id)) {
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
