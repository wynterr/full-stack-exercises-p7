import { useSelector } from "react-redux"

const Notification = () => {
  const {message, error} = useSelector((state) => state.notification)
  if (message === null) {
    return null
  }
  const notiStyle = {
    color: error ? "red" : "green",
    background: "lightgrey",
    fontSize: 20,
    borderStyle: "solid",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  }

  return (
    <div className="notification" style={notiStyle}>
      {message}
    </div>
  )
}

export default Notification
