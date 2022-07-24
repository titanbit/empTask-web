import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import axios from 'axios'


Modal.setAppElement('#root');
function App() {
  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
    },
  };

  let initialValues = {
    _id: "",
    empName: "",
    department: "",
    salary: ""
  }
  const [empList, setEmpList] = useState([])
  const [apiResponse, setApiResponse] = useState("")
  const [modalIsOpen, setIsOpen] = useState(false);
  const [empDetails, setEmpDetails] = useState({ ...initialValues });
  const [errors, setErrors] = useState({ ...initialValues });
  const [sortOrder, setSortOrder] = useState("ASC");
  const [filterObj, setFilterObj] = useState({})
  const openModal = () => {
    setIsOpen(true)
  }
  const closeModal = () => {
    setErrors({ ...initialValues })
    setEmpDetails({ ...initialValues })
    setIsOpen(false)


  }

  let getEmpList = async () => {
    let url = "http://localhost:3322/emplist"
    if (filterObj.sortItem !== undefined) {
      url = `http://localhost:3322/emplist?sortBy=${filterObj.sortItem}&order=${filterObj.sortOrder}`
    }
    let response = await axios.get(url)
    if (response.data.status) {
      setEmpList(response.data.data)
      if (sortOrder === "ASC") {
        setSortOrder("DSC")
      } else {
        setSortOrder("ASC")
      }
    } else {
      setEmpList([])
    }

  }

  const handleChange = (e) => {

    let { name, value } = e.target
    setEmpDetails((prev) => {
      return { ...prev, [name]: value }
    })
  }
  const handleFilter = (input) => {
    setFilterObj({
      sortItem: input, sortOrder
    })
  }
  const submitHandle = async () => {

    Object.keys(empDetails).map(obj => {
      if (empDetails[obj] == "") {

        setErrors((prev) => {
          return { ...prev, [obj]: "Required." }
        })
      } else {

        if (obj === "salary" && !parseFloat(empDetails[obj])) {
          setErrors((prev) => {
            return { ...prev, [obj]: "Numbers only." }
          })
        } else {
          setErrors((prev) => {
            return { ...prev, [obj]: "" }
          })
        }

      }
    })

    if (empDetails.empName !== "" && empDetails.department !== "" && empDetails.salary !== "") {
      if (empDetails._id !== "") {
        let response = await axios.post(`http://localhost:3322/updateEmpDetails/${empDetails._id}`, empDetails)
        if (response.data.status) {
          setApiResponse(response.data.message)
          closeModal()
        }
      }
      if (empDetails._id === "") {
        let response = await axios.post("http://localhost:3322/createEmp", empDetails)
        if (response.data.status) {
          setFilterObj({})
          setApiResponse(response.data.message)
          closeModal()
        }
      }

    }
  }

  const deleteEmpDetails = async (emp_id) => {
    try {
      let response = await axios.get(`http://localhost:3322/deleteEmp/${emp_id}`)
      if (response.data.status) {
        setApiResponse(response.data.message)
      }
    } catch (error) {
      console.log(error)
    }

  }

  const editDetails = async (emp_id) => {

    try {
      let response = await axios.get(`http://localhost:3322/empDetails/${emp_id}`)
      if (response.data.status) {
        setEmpDetails(response.data.data)
        openModal()
      }
    } catch (error) {
    }
  }

  useEffect(() => {
    getEmpList()
  }, [apiResponse, filterObj])
  return (
    <div className="App">
      <div className='container'>
        <div className=''>
          <button className='btn btn-primary btn-md ' onClick={openModal} >Add</button>
          <Modal
            isOpen={modalIsOpen}
            // onAfterOpen={afterOpenModal}
            onRequestClose={closeModal}
            style={customStyles}
            contentLabel="Add details"
          >
            <div>
              <div className="" >
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Emp Details</h5>
                      <button type="button" className="btn-close" onClick={closeModal} ></button>
                    </div>
                    <br />
                    <div className="modal-body">
                      <div className="mb-3">
                        <label htmlFor="empName" className="form-label">Emp name</label>
                        <input type="text" className="form-control" id="empName" name="empName" value={empDetails.empName} onChange={(e) => handleChange(e)} />
                        {errors.empName && <p className='text-danger'>{errors.empName}</p>}
                      </div>
                      <div className='mb-3'>
                        <label htmlFor="department" className="form-label"   >department</label>
                        <select className="form-select" name="department" value={empDetails.department} onChange={(e) => handleChange(e)} >
                          <option value='' >--Select</option>
                          <option value="Frontend">Frontend</option>
                          <option value="Backend">Backend</option>
                        </select>
                        {errors.department && <p className='text-danger'>{errors.department}</p>}

                      </div>
                      <div className="mb-3">
                        <label htmlFor="salary" className="form-label" >Salary</label>
                        <input type="text" className="form-control" id="salary" name="salary" value={empDetails.salary} onChange={(e) => handleChange(e)} />
                        {errors.salary && <p className='text-danger'>{errors.salary}</p>}

                      </div>

                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={closeModal}>Close</button>
                      <button type="button" className="btn btn-primary" onClick={() => submitHandle()}>Save </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Modal>
        </div>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col" ><span onClick={() => { handleFilter("empName") }} >Emp Name</span></th>
              <th scope="col" onClick={() => handleFilter("department")}>Department</th>
              <th scope="col" onClick={() => handleFilter("salary")}>Salary</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {empList.length > 0 && empList.map((obj, index) => {
              return (<tr key={obj._id}>
                <th >{index + 1}</th>
                <td>{obj.empName}</td>
                <td>{obj.department}</td>
                <td>{obj.salary}</td>
                <td><span role="button" className='badge bg-info mr-2' onClick={() => editDetails(obj._id)} >Edit</span><span role="button" className='badge bg-danger' onClick={() => deleteEmpDetails(obj._id)} >Delete</span></td>
              </tr>)
            })}

          </tbody>
        </table>
      </div>
    </div >
  );
}

export default App;
