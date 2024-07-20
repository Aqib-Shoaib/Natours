import axios from 'axios';
import { showAlert } from './alerts';

export const updateData = async (type, data) => {
  console.log(data);
  const url =
    type === 'data'
      ? 'http://127.0.0.1:8000/api/v1/users/updateMe'
      : 'http://127.0.0.1:8000/api/v1/users/update-password';

  try {
    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });
    if (res.data.status === 'success')
      showAlert('success', `${type} updated successfully`);
    window.setTimeout(() => location.reload(true), 2000);
  } catch (err) {
    console.log(err.response);
    showAlert(err.response.data.message);
  }
};
