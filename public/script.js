document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/parcels')
    .then(response => response.json())
    .then(data => {
      const tableBody = document.getElementById('parcel-table-body');
      tableBody.innerHTML = '';

      // Handle both array format and object format safely
      const parcels = Array.isArray(data) ? data : (data.parcels || []);

      if (parcels.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No parcels found.</td></tr>';
        return;
      }

      parcels.forEach(parcel => {
        const row = document.createElement('tr');
        
        let statusClass = 'badge-vacant';
        const statusLower = (parcel.status || '').toLowerCase();
        if (statusLower === 'occupied') statusClass = 'badge-occupied';
        if (statusLower === 'owned') statusClass = 'badge-owned';

        row.innerHTML = `
          <td><b>${parcel.id}</b></td>
          <td>${parcel.title || '-'}</td>
          <td>${parcel.owner_name || '-'}</td>
          <td><span class="badge ${statusClass}">${parcel.status || 'Vacant'}</span></td>
          <td>${parcel.area_sq_ft || '-'}</td>
        `;
        tableBody.appendChild(row);
      });
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      document.getElementById('parcel-table-body').innerHTML = 
        '<tr><td colspan="5" style="text-align:center; color: #ef4444;">Failed to load data!</td></tr>';
    });
});