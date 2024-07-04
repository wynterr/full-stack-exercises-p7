import { useSelector } from "react-redux"
import { Alert } from "react-bootstrap"

const Notification = () => {
  const { message, error } = useSelector((state) => state.notification)
  if (message === null) {
    return null
  }

  return (
    <Alert variant={error ? "danger" : "success"} className="notification">
      {message}
    </Alert>
  )
}

export default Notification
