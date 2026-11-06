import assert from 'node:assert/strict'
import test from 'node:test'
import { withOwnedEquipment } from './ownedEquipment.js'

test('equipped Company copy reads live Qualities and Enchantments without mutating the stored draft', () => {
  const sheet={gear:[{uid:'carried-1',inventoryId:'item-1',kind:'melee',name:'Longsword',equipped:true,enchants:[{key:'forged-fake'}]}]}
  const inventory=[{id:'item-1',kind:'equipment',item:{kind:'melee',name:'Longsword'},
    enchants:[{key:'minor:Accurate 1'}],workshopEvents:[{kind:'improve',plan:[{id:'balanced',ranks:1}]}]}]
  const out=withOwnedEquipment(sheet,inventory,'pc-1')
  assert.deepEqual(out.gear[0].enchants,inventory[0].enchants)
  assert.deepEqual(out.gear[0].workshopEvents,inventory[0].workshopEvents)
  assert.deepEqual(sheet.gear[0].enchants,[{key:'forged-fake'}])
})
test('registered starter enhancement is resolved, but wrong-name inventory cannot impersonate equipped item', () => {
  const sheet={gear:[{uid:'slot-a',kind:'armor',name:'Light Armor'},{
    uid:'slot-b',inventoryId:'item-b',kind:'melee',name:'Dagger'}]}
  const inventory=[
    {id:'starter-pc-1-slot-a',kind:'equipment',item:{kind:'armor',name:'Light Armor'},workshopEvents:[{kind:'improve',plan:[{id:'sheltering',ranks:1}]}]},
    {id:'item-b',kind:'equipment',item:{kind:'melee',name:'Longsword'},enchants:[{key:'minor:Accurate 1'}]},
  ]
  const out=withOwnedEquipment(sheet,inventory,'pc-1')
  assert.equal(out.gear[0].workshopEvents[0].plan[0].id,'sheltering')
  assert(!out.gear[1].enchants)
  assert(!sheet.gear[0].workshopEvents)
})
