<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Make a request</title>
<style type="text/css">
<!--
.style1 {
	font-family: Tahoma;
	font-size: 9px;
	font-weight: bold;
}
.style2 {
	font-family: Tahoma;
	font-weight: bold;
	font-size: 14px;
}
.style3 {
	font-family: Tahoma;
	font-weight: bold;
	font-size: 12px;
}
-->
</style>
<link rel="stylesheet" href="/Assets/site.css">
<script defer src="/Assets/site.js"></script>
</head>

<body>
<form name="requestform" action="do_addrequest.php" method="post">
<p class="style2">
  How to make a request: First click the box for the type of map or media you want.  Next the box for system.  Then, in the box below system select, type the name of the game and the name of  specific place you want mapped or media you want ripped. Only one request per slot please, remember this is a free service.</p>
<p class="style1">Mazes: Just name the area of the game  to be mapped such as X dungeon or Y town.</p>
<p class="style1">Raw Maps: Just like mazes.</p>
<p class="style1">World maps: All you really have to do  is name the game.  If you want something specific like an underworld  map then write that in the box.</p>
<p class="style1">Puzzles: Just write down the location  of the puzzle in the game, such as X room in X dungeon.</p>
<p class="style1">Charts: Name a the part of the game you  want ListMed out.  Enemy guides, item guides, passwords, anything that  would go on a chart.</p>
<p class="style1">Galleries: All you have to do is  specify what kind of gallery you want.  Enemies, objects, characters  or one specific character.</p>
<p class="style1">Music: Just name the music you want.   These will come in all kinds for formats, MP3, WAV, Midi, or other.</p>
<p class="style1">Artwork: This is where to ask for  things like sprite modifications, wallpapers, or even music remixes.   Don't be surprised if the mappers are picky about what they will and  won't do in this category.</p>

<table width="693" border="0">
  <tr>

    <td><img src="/images/ListMMazeNull.png" name="Maze" onclick="document.images['Maze'].src="https://web.archive.org/web/20101225050348id_/http://vgmapper.com/images/ListMMaze.png";
          document.images['WorldMap'].src="/images/ListMWorldMapNull.png";
          document.images['RawMap'].src="/images/ListMRawMapNull.png";
          document.images['Chart'].src="/images/ListMChartNull.png";
          document.images['Puzzle'].src="/images/ListMPuzzleNull.png";
          document.images['Gallery'].src="/images/ListMGalleryNull.png";
          document.images['Music'].src="/images/ListMMusicNull.png";
          document.images['Art'].src="/images/ListMArtNull.png";
          document.requestform.MapTyp.value ='Maze';" width="67" height="32" ></td>

    <td><img src="/images/ListMWorldMapNull.png" name="WorldMap" onclick="document.images['Maze'].src="/images/ListMMazeNull.png";
          document.images['WorldMap'].src="https://web.archive.org/web/20101225050348id_/http://vgmapper.com/images/ListMWorldMap.png";
          document.images['RawMap'].src="/images/ListMRawMapNull.png";
          document.images['Chart'].src="/images/ListMChartNull.png";
          document.images['Puzzle'].src="/images/ListMPuzzleNull.png";
          document.images['Gallery'].src="/images/ListMGalleryNull.png";
          document.images['Music'].src="/images/ListMMusicNull.png";
          document.images['Art'].src="/images/ListMArtNull.png";
          document.requestform.MapTyp.value ='WorldMap';" width="125" height="32" ></td>

    <td><img src="/images/ListMRawMapNull.png" name="RawMap" onclick="document.images['Maze'].src="/images/ListMMazeNull.png";
        document.images['WorldMap'].src="/images/ListMWorldMapNull.png";
          document.images['RawMap'].src="https://web.archive.org/web/20101225050348id_/http://vgmapper.com/images/ListMRawMap.png";
          document.images['Chart'].src="/images/ListMChartNull.png";
          document.images['Puzzle'].src="/images/ListMPuzzleNull.png";
          document.images['Gallery'].src="/images/ListMGalleryNull.png";
          document.images['Music'].src="/images/ListMMusicNull.png";
          document.images['Art'].src="/images/ListMArtNull.png";
          document.requestform.MapTyp.value ='RawMap';" width="108" height="32" ></td>

    <td><img src="/images/ListMChartNull.png" name="Chart" onclick="document.images['Maze'].src="/images/ListMMazeNull.png";
          document.images['WorldMap'].src="/images/ListMWorldMapNull.png";
          document.images['RawMap'].src="/images/ListMRawMapNull.png";
          document.images['Chart'].src="https://web.archive.org/web/20101225050348id_/http://vgmapper.com/images/ListMChart.png";
          document.images['Puzzle'].src="/images/ListMPuzzleNull.png";
          document.images['Gallery'].src="/images/ListMGalleryNull.png";
          document.images['Music'].src="/images/ListMMusicNull.png";
          document.images['Art'].src="/images/ListMArtNull.png";
          document.requestform.MapTyp.value ='Chart';" width="72" height="32" ></td>

    <td><img src="/images/ListMPuzzleNull.png" name="Puzzle" onclick="document.images['Maze'].src="/images/ListMMazeNull.png";
          document.images['WorldMap'].src="/images/ListMWorldMapNull.png";
          document.images['RawMap'].src="/images/ListMRawMapNull.png";
          document.images['Chart'].src="/images/ListMChartNull.png";
          document.images['Puzzle'].src="https://web.archive.org/web/20101225050348id_/http://vgmapper.com/images/ListMPuzzle.png";
          document.images['Gallery'].src="/images/ListMGalleryNull.png";
          document.images['Music'].src="/images/ListMMusicNull.png";
          document.images['Art'].src="/images/ListMArtNull.png";
          document.requestform.MapTyp.value ='Puzzle';" width="79" height="32" ></td>

    <td><img src="/images/ListMGalleryNull.png" name="Gallery" onclick="document.images['Maze'].src="/images/ListMMazeNull.png";
          document.images['WorldMap'].src="/images/ListMWorldMapNull.png";
          document.images['RawMap'].src="/images/ListMRawMapNull.png";
          document.images['Chart'].src="/images/ListMChartNull.png";
          document.images['Puzzle'].src="/images/ListMPuzzleNull.png";
          document.images['Gallery'].src="https://web.archive.org/web/20101225050348id_/http://vgmapper.com/images/ListMGallery.png";
          document.images['Music'].src="/images/ListMMusicNull.png";
          document.images['Art'].src="/images/ListMArtNull.png";
          document.requestform.MapTyp.value ='Gallery';"width="87" height="32" ></td>


  <td><img src="/images/ListMMusicNull.png" name="Music" onclick="document.images['Maze'].src="/images/ListMMazeNull.png";
          document.images['WorldMap'].src="/images/ListMWorldMapNull.png";
          document.images['RawMap'].src="/images/ListMRawMapNull.png";
          document.images['Chart'].src="/images/ListMChartNull.png";
          document.images['Puzzle'].src="/images/ListMPuzzleNull.png";
          document.images['Gallery'].src="/images/ListMGalleryNull.png";
          document.images['Music'].src="https://web.archive.org/web/20101225050348id_/http://vgmapper.com/images/ListMMusic.png";
          document.images['Art'].src="/images/ListMArtNull.png";
          document.requestform.MapTyp.value ='Music';" width="73" height="32" ></td>

  <td><img src="/images/ListMArtNull.png" name="Art" onclick="document.images['Maze'].src="/images/ListMMazeNull.png";
          document.images['WorldMap'].src="/images/ListMWorldMapNull.png";
          document.images['RawMap'].src="/images/ListMRawMapNull.png";
          document.images['Chart'].src="/images/ListMChartNull.png";
          document.images['Puzzle'].src="/images/ListMPuzzleNull.png";
          document.images['Gallery'].src="/images/ListMGalleryNull.png";
          document.images['Music'].src="/images/ListMMusicNull.png";
          document.images['Art'].src="https://web.archive.org/web/20101225050348id_/http://vgmapper.com/images/ListMArt.png";
          document.requestform.MapTyp.value ='Art';" width="48" height="32" ></td>


  </tr>
</table>

<table width="319" border="0">
  <tr>



    <td><img src="/images/ListSNESNull.png" name="SNES" onclick="document.images['SNES'].src="https://web.archive.org/web/20101225050348id_/http://vgmapper.com/images/ListSNES.png";
         document.images['N64'].src="/images/ListN64Null.png";
         document.images['NES'].src="/images/ListNESNull.png";
         document.images['GB'].src="/images/ListGBNull.png";
         document.images['GBC'].src="/images/ListGBCNull.png";
         document.images['GBA'].src="/images/ListGBANull.png";
         document.requestform.SystemTyp.value ='Super Nintendo';" width="171" height="32"></td>

    <td><img src="/images/ListN64Null.png" name="N64" onclick="document.images['SNES'].src="/images/ListSNESNull.png";
         document.images['N64'].src="https://web.archive.org/web/20101225050348id_/http://vgmapper.com/images/ListN64.png";
         document.images['NES'].src="/images/ListNESNull.png";
         document.images['GB'].src="/images/ListGBNull.png";
         document.images['GBC'].src="/images/ListGBCNull.png";
         document.images['GBA'].src="/images/ListGBANull.png";
         document.requestform.SystemTyp.value ='Nintendo 64';" width="138" height="32"></td>

    <td><img src="/images/ListNESNull.png" name="NES" onclick="document.images['SNES'].src="/images/ListSNESNull.png";
         document.images['N64'].src="/images/ListN64Null.png";
         document.images['NES'].src="https://web.archive.org/web/20101225050348id_/http://vgmapper.com/images/ListNES.png";
         document.images['GB'].src="/images/ListGBNull.png";
         document.images['GBC'].src="/images/ListGBCNull.png";
         document.images['GBA'].src="/images/ListGBANull.png";
         document.requestform.SystemTyp.value ='Nintendo';" width="109" height="32"></td>

    <td><img src="/images/ListGBNull.png" name="GB" onclick="document.images['SNES'].src="/images/ListSNESNull.png";
         document.images['N64'].src="/images/ListN64Null.png";
         document.images['NES'].src="/images/ListNESNull.png";
         document.images['GB'].src="https://web.archive.org/web/20101225050348id_/http://vgmapper.com/images/ListGB.png";
         document.images['GBC'].src="/images/ListGBCNull.png";
         document.images['GBA'].src="/images/ListGBANull.png";
         document.requestform.SystemTyp.value ='Game Boy';" width="119" height="32"></td>

    <td><img src="/images/ListGBCNull.png" name="GBC" onclick="document.images['SNES'].src="/images/ListSNESNull.png";
         document.images['N64'].src="/images/ListN64Null.png";
         document.images['NES'].src="/images/ListNESNull.png";
         document.images['GB'].src="/images/ListGBNull.png";
         document.images['GBC'].src="https://web.archive.org/web/20101225050348id_/http://vgmapper.com/images/ListGBC.png";
         document.images['GBA'].src="/images/ListGBANull.png";
         document.requestform.SystemTyp.value ='Game Boy Color';" width="175" height="32"></td>

    <td><img src="/images/ListGBANull.png" name="GBA" onclick="document.images['SNES'].src="/images/ListSNESNull.png";
         document.images['N64'].src="/images/ListN64Null.png";
         document.images['NES'].src="/images/ListNESNull.png";
         document.images['GB'].src="/images/ListGBNull.png";
         document.images['GBC'].src="/images/ListGBCNull.png";
         document.images['GBA'].src="https://web.archive.org/web/20101225050348id_/http://vgmapper.com/images/ListGBA.png";
         document.requestform.SystemTyp.value ='Game Boy Advance';" width="208" height="32"></td>


  </tr>
</table>


  <textarea name="GameAreaText" cols="40" rows="5" maxlength="320" style="word-wrap" ></textarea>



<table width="95" border="0">
  <tr>
   <td width="89"><input src="/images/ListSubmitNull.png" alt="submit form" height="32" type="image" width="89"></td>

  </tr>
</table>

<input name="SystemTyp" col="1" type="hidden" value="">
<input name="MapTyp" col="1" type="hidden" value="">
<input name="GameTextArea" col="1" type="hidden" value="">

</form>

<p class="style2">Whether your requested map is made, how  it's made, and how fast, depends on how much info you write in the  box.  No description means the mapper will fill the request however they  please, but too much detail can equal high difficulty and our  mappers aren't gods.  Try to be concise without leaving out what you  really want.  Here a some brief contributor bios to help you figure  out what we can and can't do.</p>
<p><a href="/Contributors/Puronen/Puronen.php"><img src="/images/ContribTropiconTh.png" width="30" height="30" border="0" /></a><span class="style3">Puronen: &ldquo;I can make maps for almost  any SNES or N64 game.  I'm great at mazes and world maps and I'm a  good gallery ripper too.  I'm a newbie when it comes to music ripping  and charts take me a while to complete.&rdquo;</span></p>
<p><a href="/Contributors/Furby/Furby.php"><img src="/Images/ContribKungFuFurbyTh.png" border="0" height="30" width="30" /></a><span class="style3">Furby:&quot;Hi,  folks. I'm KungFuFurby and if you want SNES music, I can attempt to go  through the game and locate your requested tune. I then dump it in SPC  format and convert it to MP3. Please note that sometimes I must use  patches to fix first-note sticking SPC files, and if it's undumpable in  SPC format, I have to rip it in MP3 right from the start. I'd be glad  to try for any SNES game, but I don't generally do other platforms. I  can sastify some music requests with other formats from other web  pages, but I'm not a Windows user: I'm a Mac User. Don't worry: I can  still look for a tune for you. ^_^&quot;</span></p>
</body>
</html>