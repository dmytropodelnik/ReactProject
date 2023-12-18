import Button from '../../Button/Button';

const titles = ['Ratio', 'Amounts', 'Percentage'];

const Dropdown: React.FC<{ active: string; setActive: (name: string) => void }> = ({ active, setActive }) => {
  return (
    <div className="dropdown">
      <button className="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
        Filter
      </button>
      <ul className="dropdown-menu">
        {titles.map((title, index) => (
          <li key={index}>
            <Button
              styleBtn="dropdown-item"
              onClick={() => {
                setActive(title);
              }}>
              {title}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dropdown;
