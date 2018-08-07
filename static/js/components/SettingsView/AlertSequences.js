import React, {Component} from 'react'
import glamorous, {Div} from 'glamorous'
import matchSorter from 'match-sorter'
import Downshift from 'downshift'
import axios from 'axios'

import { Well, FormControl } from 'react-bootstrap'

import '../../../css/Autocomplete.css'


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

let convertSequencesToTaxIDs = (listSequences) => {
  var _returnList = []
  listSequences.map((sequence) =>{
    _returnList.push(getTaxidFromName(sequence))
  })
  return _returnList
}


const baseEndpoint = 'https://www.ebi.ac.uk/ena/data/taxonomy/v1/taxon/suggest-for-search/'


class AlertSequences extends Component {
  state = {
    selectedSequences: [],
  }

  changeHandler = selectedSequences => {
    this.props.changeAlertSequences(convertSequencesToTaxIDs(selectedSequences))
    this.setState({selectedSequences})
  }

  render() {
    return (
      <div>
        <Div display="inline" justifyContent="left">
          <MultipleAutocomplete
            values={this.state.selectedSequences}
            onChange={(this.changeHandler)}
          />
        </Div>
      </div>
    )
  }
}

const Label = glamorous.label({fontWeight: 'bold', display: 'block'})

const Item = glamorous.div(
  {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'left',
    border: 'none',
    height: 'auto',
    textAlign: 'left',
    borderTop: 'none',
    lineHeight: '1em',
    color: 'rgba(0,0,0,.87)',
    fontSize: '1rem',
    textTransform: 'none',
    fontWeight: '400',
    boxShadow: 'none',
    padding: '.8rem 1.1rem',
    boxSizing: 'border-box',
    whiteSpace: 'normal',
    wordWrap: 'normal',
    padding: '10px'
  },
  ({isActive, isSelected}) => ({
    opacity: isSelected ? 0.5 : 1,
    backgroundColor: isActive ? 'lightgrey' : 'white',
    '&:hover, &:focus': {
      borderColor: '#96c8da',
      boxShadow: '0 2px 3px 0 rgba(34,36,38,.15)',
    },
  }),
)

const ItemLabel = glamorous.span({
  display: 'inlineBlock',
  padding: '4px 6px',
  color: '#fff',
  background: '#ddd',
  textTransform: 'uppercase',
  borderRadius: 'borderRadius',
  marginLeft: 'auto',
  fontSize: 10,
})

const Input = glamorous.input({
  fontSize: 14,
  wordWrap: 'break-word',
  outline: 0,
  whiteSpace: 'normal',
  background: 'transparent',
  display: 'inline-block',
  color: 'rgba(0,0,0,.87)',
  boxShadow: 'none',
  border: '0',
})

// this is just a demo of how you'd use the getRootProps function
// normally you wouldn't need this kind of abstraction
function Root({innerRef, ...rest}) {
  return <div ref={innerRef} {...rest} />
}

class MultipleAutocomplete extends React.Component {
  state = {
    input: '',
    items: []
  }

  render() {
    const {values} = this.props
    const {input} = this.state
    const items = input.length
      ? matchSorter(this.state.items, input)
      : this.state.items
    const indices = mapItemIndex(items, values)

    return (
      <Downshift
        inputValue={this.state.input}
        onChange={this.handleChange}
        selectedItem={values}
      >
        {({
          getInputProps,
          getItemProps,
          getRootProps,
          highlightedIndex,
          isOpen,
          selectedItem,
        }) => (
          <Root {...getRootProps({refKey: 'innerRef'})}>

            {selectedItem.map((value, i) => (
              <Well
                key={i}
                style={{
                  padding: 10 + 'px'
                }}
              > {value}
              </Well>
            ))}
            <FormControl
              {...getInputProps({
                placeholder: 'Species Name...',
                onChange: this.handleInputChange,
                onKeyDown: this.handleKeyDown
              })}
            />

            {isOpen && (
              <div
                className="suggestionBox"
                style={{
                  border: '1px solid rgba(34,36,38,.15)',
                  maxHeight: 400,
                  overflowY: 'scroll',
                }}
              >
                {items.map(item => {
                  const selected = this.props.values.indexOf(item) !== -1

                  const props = selected
                    ? {}
                    : getItemProps({
                        item,
                        index: indices[item],
                        isActive: highlightedIndex === indices[item],
                        isSelected: selected,
                      })

                  return (
                    <Item {...props} key={item}>
                      {item}
                      {selected && <ItemLabel>Selected</ItemLabel>}
                    </Item>
                  )
                })}
              </div>
            )}
          </Root>
        )}
      </Downshift>
    )
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

  handleKeyDown = evt => {

    const val = evt.target.value
    if (!val) {
      return
    }
    // call the debounce function
    this.fetchRepository(val)


    // const {values} = this.props
    // if (values.length && !this.state.input.length && evt.keyCode == 8) {
    //   this.props.onChange(values.slice(0, values.length - 1))
    // }
  }

  handleInputChange = evt => {
    this.setState({input: evt.target.value})
  }

  handleChange = item => {
    this.props.onChange([...this.props.values, item])
    this.setState({input: ''})
  }
}

/**
 * Get the real index of an item.
 *
 * It does this filtering out selected values, and mapping the values to the index.
 * We're doing so that Downshift doesn't recognize selected item,
 * thus won't highlight the selected item.
 *
 * Given that ['Black', 'Blue', 'Green'], and 'Blue' is selected
 * Output: { 'Black': 0, 'Green': 1 }
 *
 * @param {String[]} items items
 * @param {String[]} values selected items
 * @return {Object} Mapping of selected items to their indices
 */
function mapItemIndex(items, values) {
  return items
    .filter(item => values.indexOf(item) === -1)
    .reduce((prev, next, i) => {
      prev[next] = i
      return prev
    }, {})
}

export default AlertSequences
