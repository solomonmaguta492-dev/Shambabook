import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import Spinner from '../components/Spinner.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useFarm } from '../hooks/useFarm.js';
import { useToast } from '../hooks/useToast.js';
import { searchTowns } from '../services/geocodingApi.js';
import { validateRequired } from '../utils/validators.js';

/* "Nakuru, Nakuru County", or just "Nakuru" when the API gives no region */
function placeLabel(place) {
  return place.region ? `${place.name}, ${place.region}` : place.name;
}

const cardClasses = 'rounded-xl border border-stone-300 bg-white p-5';

function Profile() {
  const { user, updateName, logout } = useAuth();
  const { profile, profileLoading, saveLocation } = useFarm();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState(user.displayName ?? '');
  const [nameError, setNameError] = useState('');
  const [savingName, setSavingName] = useState(false);
  const nameRef = useRef(null);

  const [query, setQuery] = useState('');
  const [queryError, setQueryError] = useState('');
  /* 'idle', 'loading', 'done' or 'error' */
  const [searchStatus, setSearchStatus] = useState('idle');
  const [results, setResults] = useState([]);
  const queryRef = useRef(null);

  async function handleNameSubmit(event) {
    event.preventDefault();

    const error = validateRequired(name, 'Full name');
    setNameError(error);
    if (error) {
      nameRef.current.focus();
      return;
    }

    setSavingName(true);
    try {
      await updateName(name.trim());
      showToast('Name updated', 'success');
    } catch {
      showToast("Couldn't update your name. Please try again.", 'error');
    } finally {
      setSavingName(false);
    }
  }

  /* Ask the geocoding API for towns that match what the farmer typed */
  async function runSearch() {
    if (query.trim().length < 2) {
      setQueryError('Please type at least 2 letters');
      queryRef.current.focus();
      return;
    }

    setQueryError('');
    setSearchStatus('loading');
    try {
      const towns = await searchTowns(query.trim());
      setResults(towns);
      setSearchStatus('done');
    } catch {
      setSearchStatus('error');
    }
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    runSearch();
  }

  /* Optimistic save: say "done" now, and only speak up again if Firestore fails */
  function handlePick(place) {
    showToast(`Location saved: ${place.name}`, 'success');
    setResults([]);
    setQuery('');
    setSearchStatus('idle');

    saveLocation(place).catch(() => {
      showToast("Couldn't save your location. Please try again.", 'error');
    });
  }

  async function handleLogout() {
    await logout();
    showToast("You've been logged out", 'success');
    navigate('/');
  }

  /* Picks what to show under the search box */
  function renderResults() {
    if (searchStatus === 'loading') {
      return <Spinner label="Searching…" />;
    }

    if (searchStatus === 'error') {
      return (
        <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-center text-rose-700">
          <p>We couldn't search for towns. Please check your connection.</p>
          <Button variant="secondary" onClick={runSearch} className="mt-3">
            Retry
          </Button>
        </div>
      );
    }

    if (searchStatus === 'done' && results.length === 0) {
      return <p className="text-stone-600">No towns found</p>;
    }

    return (
      <ul className="flex flex-col gap-2">
        {results.map((place) => (
          <li key={`${place.latitude},${place.longitude}`}>
            <button
              type="button"
              onClick={() => handlePick(place)}
              className="w-full rounded-lg border border-stone-300 px-4 py-3 text-left font-medium text-stone-900 hover:border-green-700 hover:bg-green-50 focus-visible:outline-2 focus-visible:outline-green-700"
            >
              {placeLabel(place)}
            </button>
          </li>
        ))}
      </ul>
    );
  }

  function renderCurrentLocation() {
    if (profileLoading) {
      return <p className="text-stone-600">Loading…</p>;
    }

    if (!profile?.location) {
      return <p className="text-stone-600">No location set yet</p>;
    }

    return <p className="text-lg font-semibold text-stone-900">{placeLabel(profile.location)}</p>;
  }

  return (
    <section>
      <h1 className="text-2xl font-bold md:text-3xl">Profile</h1>

      <div className="mt-6 flex flex-col gap-6">
        <section aria-labelledby="account-heading" className={cardClasses}>
          <h2 id="account-heading" className="text-lg font-semibold text-stone-900">
            Account
          </h2>
          <form onSubmit={handleNameSubmit} noValidate className="mt-4 flex flex-col gap-4">
            <Input id="profile-email" label="Email" type="email" value={user.email ?? ''} readOnly />
            <Input
              id="profile-name"
              label="Full name"
              ref={nameRef}
              value={name}
              onChange={(event) => setName(event.target.value)}
              error={nameError}
              autoComplete="name"
            />
            <div>
              <Button type="submit" disabled={savingName} className="disabled:opacity-60">
                {savingName ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </form>
        </section>

        <section aria-labelledby="location-heading" className={cardClasses}>
          <h2 id="location-heading" className="text-lg font-semibold text-stone-900">
            Farm location
          </h2>
          <div className="mt-2">{renderCurrentLocation()}</div>

          <form onSubmit={handleSearchSubmit} noValidate className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="flex-1">
              <Input
                id="town-search"
                label="Search your town"
                ref={queryRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                error={queryError}
                placeholder="e.g. Nakuru"
              />
            </div>
            <Button
              type="submit"
              disabled={searchStatus === 'loading'}
              className="disabled:opacity-60 sm:mt-7"
            >
              Search
            </Button>
          </form>

          <div aria-live="polite" className="mt-4">
            {renderResults()}
          </div>
        </section>

        <div>
          <Button variant="secondary" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </div>
    </section>
  );
}

export default Profile;
