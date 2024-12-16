import { useState, useEffect, useMemo, ChangeEvent } from 'react';
import { debounce } from 'lodash';
import './App.css';

interface Address {
	city: string;
  }
  
  interface User {
	id: number;
	firstName: string;
	lastName: string;
	birthDate: string;
	address: Address;
  }
  
  interface ApiResponse {
	users: User[];
	total: number;
	skip: number;
	limit: number;
  }


  
function App() {
	const [users, setUsers] = useState<User[]>([]);
	const [nameFilter, setNameFilter] = useState<string>('');
	const [selectedCity, setSelectedCity] = useState<string>('');
	const [highlightOldest, setHighlightOldest] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(true);
  
	useEffect(() => {
	const fetchUsers = async () => {
	try {
		const response = await fetch('https://dummyjson.com/users');
		const data: ApiResponse = await response.json();
		setUsers(data.users);
		setLoading(false);
	} catch (error) {
		console.error('Error fetching users:', error);
		setLoading(false);
	}
	};

	fetchUsers();
}, []);
  
	const cities = useMemo(() => {
	  const uniqueCities = [...new Set(users.map(user => user.address.city))];
	  return uniqueCities.sort();
	}, [users]);
  
	const oldestPerCity = useMemo(() => {
	  const cityGroups = users.reduce<Record<string, User>>((acc, user) => {
		const city = user.address.city;
		if (!acc[city] || new Date(user.birthDate) < new Date(acc[city].birthDate)) {
		  acc[city] = user;
		}
		return acc;
	  }, {});
	  return Object.values(cityGroups).map(user => user.id);
	}, [users]);
  
	const debouncedFilter = useMemo(
	  () => debounce((value: string) => setNameFilter(value), 1000),
	  []
	);
  
	const filteredUsers = useMemo(() => {
	  return users.filter(user => {
		const nameMatch = (user.firstName.toLowerCase() + ' ' + user.lastName.toLowerCase())
		  .includes(nameFilter.toLowerCase());
		const cityMatch = !selectedCity || user.address.city === selectedCity;
		return nameMatch && cityMatch;
	  });
	}, [users, nameFilter, selectedCity]);
  
	const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
	  debouncedFilter(event.target.value);
	};
  
	return (
	  <>
		<div className="home-card">
		  <div className="customer-list">
			{/* Filter Controls */}
			<div className="filters">
			  <input
				type="text"
				placeholder="Search by name..."
				onChange={handleNameChange}
				className="filter-input"
			  />
			  <select
				value={selectedCity}
				onChange={(e) => setSelectedCity(e.target.value)}
				className="filter-select"
			  >
				<option value="">Select city</option>
				{cities.map(city => (
				  <option key={city} value={city}>{city}</option>
				))}
			  </select>
			  <label className="filter-checkbox">
				<input
					type="checkbox"
					checked={highlightOldest}
					onChange={(e) => setHighlightOldest(e.target.checked)}
				/>
				<span>Highlight oldest per city</span>
				</label>

			</div>
  
			{/* Users Table */}
			<div className="table-container">
			  <table>
				<thead>
				  <tr>
					<th>Name</th>
					<th>City</th>
					<th>Birthday</th>
				  </tr>
				</thead>
				<tbody>
				  {loading ? (
					<tr>
					  <td colSpan={3} className="loading">Loading...</td>
					</tr>
				  ) : (
					filteredUsers.map(user => (
					  <tr
						key={user.id}
						className={highlightOldest && oldestPerCity.includes(user.id) ? 'highlighted' : ''}
					  >
						<td>{`${user.firstName} ${user.lastName}`}</td>
						<td>{user.address.city}</td>
						<td>{new Date(user.birthDate).toLocaleDateString()}</td>
					  </tr>
					))
				  )}
				</tbody>
			  </table>
			</div>
		  </div>
		</div>
	  </>
	);
  }
  
  export default App;