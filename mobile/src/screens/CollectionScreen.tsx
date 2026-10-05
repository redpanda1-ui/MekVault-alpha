import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Button, CardRow, Input, Loading, Screen, Title, ui } from '../components/ui';
import { useVault } from '../context/VaultContext';
import { searchCards } from '../services/scryfall';
import type { ScryfallCard } from '../types/mtg';
const FILTERS=['All','Creature','Land','Artifact','Enchantment','Instant','Sorcery'];
export function CollectionScreen() {
 const {collection,addToCollection}=useVault(); const [query,setQuery]=useState(''); const [results,setResults]=useState<ScryfallCard[]>([]); const [loading,setLoading]=useState(false); const [error,setError]=useState(''); const [filter,setFilter]=useState('All');
 const visibleCollection=useMemo(()=>filter==='All'?collection:collection.filter(({card})=>card.typeLine.includes(filter)),[collection,filter]);
 const search=async()=>{if(!query.trim())return;setLoading(true);setError('');try{setResults(await searchCards(query.trim()));}catch(value){setError(value instanceof Error?value.message:'Search failed.');}finally{setLoading(false);}};
 return <Screen><Title subtitle="Live card art, print data, and prices supplied by Scryfall.">Collection</Title><Input value={query} onChangeText={setQuery} onSubmitEditing={()=>void search()} placeholder="Search by card name, type, oracle text…" returnKeyType="search"/><Button title="Search cards" onPress={()=>void search()} disabled={loading}/>{error?<Text style={ui.error}>{error}</Text>:null}{loading?<Loading/>:results.map((card)=><CardRow key={card.id} card={card} action={()=>addToCollection(card)} actionLabel="+ Add to collection"/>)}
 <Text style={ui.heading}>In your vault</Text><View style={[ui.row,{flexWrap:'wrap',marginBottom:12}]}>{FILTERS.map((name)=><Pressable key={name} onPress={()=>setFilter(name)} style={[ui.panel,{paddingHorizontal:10,paddingVertical:7,marginBottom:0},filter===name&&{borderColor:'#d6aa5d'}]}><Text style={ui.text}>{name}</Text></Pressable>)}</View>{visibleCollection.length===0?<Text style={ui.muted}>{collection.length?'No cards match this filter.':'No cards saved yet. Search above to begin.'}</Text>:visibleCollection.map(({card,quantity})=><View key={card.id}><CardRow card={card}/><Text style={[ui.label,{marginTop:-6,marginBottom:18}]}>OWNED × {quantity}</Text></View>)}</Screen>;
}