import { useState, type FormEvent } from "react";
import { Modal } from "./Modal";
import "./JumpToDateModal.scss";

interface JumpToDateModalProps {
  initialDate: Date;
  onSubmit: (date: Date) => void;
  onClose: () => void;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function JumpToDateModal({ initialDate, onSubmit, onClose }: JumpToDateModalProps) {
  const [month, setMonth] = useState(initialDate.getMonth());
  const [day, setDay] = useState(initialDate.getDate());
  const [year, setYear] = useState(initialDate.getFullYear());

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!day || !year) return;
    onSubmit(new Date(year, month, day));
    onClose();
  }

  return (
    <Modal title="Jump to Date" onClose={onClose} className="modal--compact">
      <form className="jump-to-date" onSubmit={handleSubmit}>
        <div className="jump-to-date__fields">
          <label className="jump-to-date__field jump-to-date__field--month">
            <span className="jump-to-date__label">Month</span>
            <select
              value={month}
              onChange={(event) => setMonth(Number(event.target.value))}
              aria-label="Month"
            >
              {MONTHS.map((name, index) => (
                <option key={name} value={index}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          <label className="jump-to-date__field jump-to-date__field--day">
            <span className="jump-to-date__label">Day</span>
            <input
              type="number"
              min={1}
              max={31}
              value={day}
              onChange={(event) => setDay(Number(event.target.value))}
              aria-label="Day"
            />
          </label>

          <label className="jump-to-date__field jump-to-date__field--year">
            <span className="jump-to-date__label">Year</span>
            <input
              type="number"
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
              aria-label="Year"
            />
          </label>
        </div>

        <button type="submit" className="jump-to-date__go">
          GO
        </button>
      </form>
    </Modal>
  );
}
