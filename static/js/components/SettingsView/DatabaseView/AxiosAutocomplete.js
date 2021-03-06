import React, {Component} from 'react'
import { FormGroup, FormControl } from 'react-bootstrap'
import axios from 'axios'
import Downshift from 'downshift'

import '../../../../css/Autocomplete.css'

function debounce(fn, time) {
  let timeoutId
  return wrapper
  function wrapper(...args) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      timeoutId = null
      fn(...args)
    }, time)
  }
}

let getTaxidFromName = (name) => {
	var regExp = /\(([^)]+)\)/;

    var result = regExp.exec(name)

    var tax_data = result[result.length-1].split(":")

    var tax_id = tax_data[tax_data.length-1]

    return tax_id
}


const baseEndpoint = 'https://www.ebi.ac.uk/ena/data/taxonomy/v1/taxon/suggest-for-search/'


class AxiosAutocomplete extends Component {
  constructor(props) {
    super(props)
    this.state = {items: [], choice: ''}
  }

  fetchRepository = debounce(value => {
    axios
      .get(baseEndpoint + value)
      .then(response => {
        const items = response.data.map(
          item => `${item.scientificName} (tax_id:${item.taxId})`,
        ) // Added ID to make it unique
        this.setState({items})

      })
      .catch(error => {
        console.log(error)
      })
  }, 300)

  render() {
    return (
      <div>
      <Downshift
        onChange={selection => this.props.changeChoice(getTaxidFromName(selection)) }
      >
        {({
          selectedItem,
          getInputProps,
          getItemProps,
          highlightedIndex,
          isOpen,
        }) => {
          return (
            <div>
              <FormGroup>
                <FormControl
                placeholder="Parent Scientific Name"
                {...getInputProps({
                  onChange: event => {
                    const value = event.target.value
                    if (!value) {
                      return
                    }
                    // call the debounce function
                    this.fetchRepository(value)
                  }
                })}
                />
              </FormGroup>
              {isOpen && (
                <div className="suggestionBox">
                  {this.state.items.map((item, index) => (
                    <div
                      className="individualSuggestion"
                      key={index}
                      {...getItemProps({
                        item,
                        style: {
                          padding: 10 + 'px',
                          backgroundColor:
                            highlightedIndex === index ? '#F2F2F2' : 'white',
                          fontWeight: selectedItem === item ? 'bolder' : 'normal',
                        },
                      })}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        }}
      </Downshift>
      </div>
    )
  }
}
export default AxiosAutocomplete;
