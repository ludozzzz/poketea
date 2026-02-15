import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./hooks/useAuth";
import { useProducts } from "./hooks/useProducts";
import { useOrders } from "./hooks/useOrders";
import { useConfig } from "./hooks/useConfig";

const CATEGORIES = [
  {id:"entrees",name:"Entrées",emoji:"🥟"},{id:"poke-signature",name:"Poké Signature",emoji:"🍣"},
  {id:"cree-ton-poke",name:"Crée Ton Poké",emoji:"🥗"},{id:"plats-chauds",name:"Plats Chauds",emoji:"🍜"},
  {id:"sushi-bar",name:"Sushi Bar",emoji:"🍱"},{id:"fruithe",name:"Fruithé",emoji:"🧋"},
  {id:"the-au-lait",name:"Thé au Lait",emoji:"🥤"},{id:"the-nature",name:"Thé Nature",emoji:"🍵"},
  {id:"cafes",name:"Nos Cafés",emoji:"☕"},{id:"softs",name:"Softs",emoji:"🥤"},
  {id:"bieres",name:"Bières",emoji:"🍺"},{id:"desserts",name:"Desserts",emoji:"🍡"},
];

const MODES = [
  {id:"emporter",label:"A emporter",sub:"Commandez et récupérez sur place",icon:"🥡",color:"#e85d3a"},
  {id:"surplace",label:"Sur place",sub:"Mangez au restaurant",icon:"🍽",color:"#16a34a"},
];
const STATUSES = ["nouvelle","en préparation","prête","récupérée","annulée"];
const RULES = [{i:"🛒",t:"1 euro dépensé = 1 point gagné"},{i:"🎁",t:"100 pts = 5 euros de réduction"},{i:"🎂",t:"Double points le jour de votre anniversaire"},{i:"⭐",t:"Offres exclusives pour les membres"}];

function stc(s){return{"nouvelle":"s1","en préparation":"s2","prête":"s3","récupérée":"s4","annulée":"s5"}[s]||"s1";}
function fd(d){if(!d)return"";const dt=d.toDate?d.toDate():new Date(d);return dt.toLocaleDateString("fr-FR",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=Playfair+Display:wght@600;700;800&display=swap');
:root{--bg:#f6f5f0;--w:#fff;--bd:#e8e5dd;--bl:#f0ede6;--ac:#e85d3a;--ah:#d4512f;--as:rgba(232,93,58,.08);--as2:rgba(232,93,58,.04);--gr:#16a34a;--gs:rgba(22,163,74,.08);--yl:#d97706;--ys:rgba(217,119,6,.08);--pu:#7c3aed;--ps:rgba(124,58,237,.08);--rd:#dc2626;--rds:rgba(220,38,38,.08);--t:#1a1a1a;--t2:#6b6560;--t3:#a09a92;--t4:#c4bfb7;--r:14px;--rs:10px;--rx:6px;--sh:0 4px 16px rgba(0,0,0,.06);--sl:0 12px 40px rgba(0,0,0,.1);--fd:'Playfair Display',Georgia,serif;--fb:'DM Sans',system-ui,sans-serif;}
*{margin:0;padding:0;box-sizing:border-box;}html{scroll-behavior:smooth;}body{font-family:var(--fb);background:var(--bg);color:var(--t);-webkit-font-smoothing:antialiased;line-height:1.5;}button{font-family:var(--fb);cursor:pointer;}input,select,textarea{font-family:var(--fb);}
.tb{position:sticky;top:0;z-index:100;background:rgba(255,255,255,.92);backdrop-filter:blur(16px) saturate(180%);border-bottom:1px solid var(--bl);height:58px;display:flex;align-items:center;padding:0 20px;}
.tbr{display:flex;align-items:center;gap:10px;cursor:pointer;flex-shrink:0;}.tblogo{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#1a1a1a,#444);display:flex;align-items:center;justify-content:center;font-size:16px;color:white;box-shadow:0 2px 8px rgba(0,0,0,.15);}
.tbn{font-size:14px;font-weight:700;letter-spacing:-.3px;}.tbs{font-size:9px;font-weight:700;padding:2px 7px;border-radius:8px;display:inline-block;width:fit-content;text-transform:uppercase;letter-spacing:.5px;}.tbs.op{background:var(--gs);color:var(--gr);}.tbs.cl{background:var(--rds);color:var(--rd);}
.tnv{display:flex;align-items:center;gap:2px;margin-left:auto;}.tlk{display:flex;align-items:center;gap:5px;padding:7px 12px;border-radius:var(--rs);border:none;background:0;color:var(--t2);font-size:12.5px;font-weight:500;transition:all .15s;white-space:nowrap;}.tlk:hover,.tlk.a{background:var(--as);color:var(--ac);}
.tsp{width:1px;height:22px;background:var(--bd);margin:0 3px;}.tcart{position:relative;display:flex;align-items:center;gap:5px;padding:7px 14px;border-radius:var(--rs);border:1.5px solid var(--bd);background:var(--w);color:var(--t);font-size:12.5px;font-weight:600;transition:all .15s;}.tcart:hover{border-color:var(--ac);color:var(--ac);}
.tcb{position:absolute;top:-5px;right:-5px;background:var(--ac);color:white;font-size:9px;font-weight:700;width:17px;height:17px;border-radius:50%;display:flex;align-items:center;justify-content:center;}
.ub{display:flex;align-items:center;gap:5px;padding:7px 12px;border-radius:var(--rs);border:1.5px solid var(--bl);background:var(--w);color:var(--t);font-size:12px;font-weight:600;transition:all .15s;}.ub:hover{border-color:var(--ac);color:var(--ac);}
.uav{width:22px;height:22px;border-radius:50%;background:var(--ac);color:white;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;}
.bnav{display:none;position:fixed;bottom:0;left:0;right:0;z-index:100;background:rgba(255,255,255,.96);backdrop-filter:blur(16px) saturate(180%);border-top:1px solid var(--bl);padding:6px 8px calc(6px + env(safe-area-inset-bottom,0px));justify-content:space-around;align-items:center;}
.bnav-i{display:flex;flex-direction:column;align-items:center;gap:2px;padding:4px 12px;border-radius:12px;border:none;background:0;color:var(--t3);font-size:9px;font-weight:500;transition:all .15s;position:relative;min-width:56px;}
.bnav-i span:first-child{font-size:18px;line-height:1;}.bnav-i.a{color:var(--ac);}.bnav-i.a::after{content:'';position:absolute;top:-6px;left:50%;transform:translateX(-50%);width:20px;height:3px;border-radius:2px;background:var(--ac);}
.bnav-badge{position:absolute;top:-2px;right:6px;background:var(--ac);color:white;font-size:8px;font-weight:700;width:15px;height:15px;border-radius:50%;display:flex;align-items:center;justify-content:center;}
.ov{position:fixed;inset:0;background:rgba(0,0,0,.32);backdrop-filter:blur(5px);z-index:300;display:flex;align-items:center;justify-content:center;animation:fi .2s;}@keyframes fi{from{opacity:0}to{opacity:1}}
.md{background:var(--w);border-radius:20px;padding:28px;width:min(460px,92vw);max-height:88vh;overflow-y:auto;box-shadow:var(--sl);animation:si .3s cubic-bezier(.34,1.56,.64,1);}@keyframes si{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}
.mt{font-family:var(--fd);font-size:19px;font-weight:700;margin-bottom:18px;}
.fg{margin-bottom:12px;}.fl{display:block;font-size:10.5px;font-weight:600;color:var(--t2);margin-bottom:4px;text-transform:uppercase;letter-spacing:.7px;}
.fi{width:100%;padding:10px 14px;border:1.5px solid var(--bd);border-radius:var(--rs);background:var(--w);color:var(--t);font-size:14px;transition:border-color .15s;}.fi:focus{outline:0;border-color:var(--ac);}
.fr{display:grid;grid-template-columns:1fr 1fr;gap:10px;}.fxa{display:flex;gap:8px;margin-top:18px;}.gbtn{flex:1;padding:11px;border:1.5px solid var(--bd);border-radius:var(--rs);background:0;color:var(--t2);font-size:13px;font-weight:500;transition:all .15s;}.gbtn:hover{border-color:var(--t3);color:var(--t);}
.pbtn{flex:1;padding:11px;border:none;border-radius:var(--rs);background:var(--ac);color:white;font-size:13px;font-weight:600;transition:all .15s;}.pbtn:hover{background:var(--ah);}.pbtn:disabled{opacity:.5;cursor:not-allowed;}
.atabs{display:flex;gap:0;margin-bottom:20px;background:var(--bg);border-radius:var(--rs);padding:3px;}.atab{flex:1;padding:9px 6px;border:none;border-radius:8px;background:0;color:var(--t3);font-size:12.5px;font-weight:600;transition:all .15s;white-space:nowrap;}.atab.a{background:var(--w);color:var(--t);box-shadow:0 1px 3px rgba(0,0,0,.06);}
.orsep{display:flex;align-items:center;gap:12px;margin:16px 0;font-size:11px;color:var(--t4);}.orsep::before,.orsep::after{content:'';flex:1;height:1px;background:var(--bl);}
.hero{position:relative;padding:48px 20px 40px;text-align:center;background:linear-gradient(180deg,var(--w) 0%,var(--bg) 100%);overflow:hidden;}.hero::before{content:'';position:absolute;top:-100px;left:50%;transform:translateX(-50%);width:550px;height:550px;border-radius:50%;background:radial-gradient(circle,var(--as) 0%,transparent 70%);pointer-events:none;}
.hbd{display:inline-flex;align-items:center;gap:5px;padding:5px 14px;border-radius:18px;background:var(--as);color:var(--ac);font-size:11.5px;font-weight:600;margin-bottom:16px;}.hti{font-family:var(--fd);font-size:clamp(30px,5vw,44px);font-weight:800;letter-spacing:-1px;line-height:1.15;margin-bottom:10px;}.hti span{color:var(--ac);}
.hds{font-size:14px;color:var(--t2);max-width:400px;margin:0 auto 22px;}.hbt{display:inline-flex;align-items:center;gap:7px;padding:13px 30px;border-radius:var(--r);border:none;background:var(--ac);color:white;font-size:14px;font-weight:700;box-shadow:0 4px 16px rgba(232,93,58,.28);transition:all .2s;}.hbt:hover{background:var(--ah);transform:translateY(-2px);}
.hin{display:flex;gap:20px;justify-content:center;flex-wrap:wrap;margin-top:18px;}.hin span{font-size:12px;color:var(--t3);}
.cn{position:sticky;top:58px;z-index:90;background:rgba(246,245,240,.92);backdrop-filter:blur(12px);border-bottom:1px solid var(--bl);padding:10px 16px;overflow-x:auto;display:flex;gap:6px;scrollbar-width:none;}.cn::-webkit-scrollbar{display:none;}
.cc{flex-shrink:0;padding:7px 16px;border-radius:20px;border:1px solid var(--bd);background:var(--w);color:var(--t2);font-size:13px;font-weight:500;transition:all .15s;white-space:nowrap;}.cc:hover{border-color:var(--t3);}.cc.a{background:var(--ac);color:white;border-color:var(--ac);}
.ms{padding:28px 16px;max-width:1060px;margin:0 auto;}.shd{display:flex;align-items:center;gap:10px;margin-bottom:16px;padding-bottom:10px;border-bottom:1px solid var(--bl);}.se{font-size:22px;}.stt{font-family:var(--fd);font-size:20px;font-weight:700;}.sct{font-size:10px;color:var(--t3);background:var(--bg);padding:3px 9px;border-radius:7px;font-weight:500;}
.pg{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:12px;}
.pc{background:var(--w);border:1px solid var(--bl);border-radius:var(--r);padding:14px;display:flex;flex-direction:column;position:relative;transition:all .2s;overflow:hidden;}.pc:hover{border-color:var(--bd);box-shadow:0 2px 8px rgba(0,0,0,.05);transform:translateY(-1px);}.pc.off{opacity:.4;pointer-events:none;}
.pop{position:absolute;top:10px;right:10px;background:var(--ac);color:white;font-size:8.5px;font-weight:700;padding:2.5px 7px;border-radius:5px;text-transform:uppercase;z-index:2;}
.pn{font-size:14px;font-weight:600;margin-bottom:3px;padding-right:50px;line-height:1.3;}.pde{font-size:12px;color:var(--t3);line-height:1.45;margin-bottom:10px;flex:1;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.pfo{display:flex;align-items:center;justify-content:space-between;margin-top:auto;}.pp{font-size:17px;font-weight:800;color:var(--ac);}.pp small{font-size:12px;font-weight:600;}
.addb{width:36px;height:36px;border-radius:50%;border:2px solid var(--ac);background:0;color:var(--ac);font-size:18px;display:flex;align-items:center;justify-content:center;transition:all .15s;-webkit-tap-highlight-color:transparent;}.addb:hover,.addb:active{background:var(--ac);color:white;transform:scale(1.05);}
.cov{position:fixed;inset:0;background:rgba(0,0,0,.28);backdrop-filter:blur(4px);z-index:200;animation:fi .2s;}.cdr{position:fixed;top:0;right:0;bottom:0;width:min(380px,100vw);background:var(--w);z-index:201;display:flex;flex-direction:column;animation:sli .3s cubic-bezier(.4,0,.2,1);box-shadow:var(--sl);}@keyframes sli{from{transform:translateX(100%)}to{transform:translateX(0)}}
.chd{padding:16px 18px;border-bottom:1px solid var(--bl);display:flex;align-items:center;justify-content:space-between;}.cht{font-family:var(--fd);font-size:16px;font-weight:700;}.clb{width:34px;height:34px;border-radius:50%;border:1px solid var(--bd);background:0;color:var(--t3);font-size:15px;display:flex;align-items:center;justify-content:center;transition:all .15s;-webkit-tap-highlight-color:transparent;}.clb:hover,.clb:active{border-color:var(--rd);color:var(--rd);}
.cmtag{margin:10px 18px;padding:7px 12px;border-radius:var(--rs);background:var(--as2);border:1px solid var(--as);font-size:11.5px;color:var(--ac);font-weight:500;display:flex;align-items:center;gap:6px;}
.citms{flex:1;overflow-y:auto;padding:6px 18px;-webkit-overflow-scrolling:touch;}.cemp{text-align:center;padding:40px 0;color:var(--t3);}.ceme{font-size:38px;margin-bottom:8px;}.citm{display:flex;align-items:center;gap:10px;padding:12px 0;border-bottom:1px solid var(--bl);}
.qc{display:flex;align-items:center;gap:6px;}.qb{width:28px;height:28px;border-radius:50%;border:1px solid var(--bd);background:var(--w);color:var(--t2);font-size:13px;display:flex;align-items:center;justify-content:center;transition:all .12s;-webkit-tap-highlight-color:transparent;}.qb:hover,.qb:active{border-color:var(--ac);color:var(--ac);}
.cft{padding:16px 18px;border-top:1px solid var(--bl);background:#faf9f5;}.ckb{width:100%;padding:14px;border:none;border-radius:var(--rs);background:var(--ac);color:white;font-size:14px;font-weight:700;transition:all .15s;-webkit-tap-highlight-color:transparent;}.ckb:hover,.ckb:active{background:var(--ah);}
.moo{display:flex;flex-direction:column;gap:8px;}.mop{display:flex;align-items:center;gap:14px;padding:14px 16px;border:1.5px solid var(--bl);border-radius:var(--r);background:var(--w);cursor:pointer;transition:all .2s;-webkit-tap-highlight-color:transparent;}.mop:hover,.mop:active{border-color:var(--ac);background:var(--as2);}
.acch{display:flex;align-items:center;gap:14px;margin-bottom:24px;}.accav{width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,var(--ac),#ff9966);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;color:white;}
.accn{font-family:var(--fd);font-size:20px;font-weight:700;}.acce{font-size:12px;color:var(--t3);}.accs{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:20px;}.accst{text-align:center;padding:14px 6px;background:var(--bg);border-radius:var(--rs);}.accv{font-size:18px;font-weight:800;}.accl{font-size:9px;color:var(--t3);text-transform:uppercase;letter-spacing:.5px;margin-top:2px;}
.ocard{border:1px solid var(--bl);border-radius:var(--rs);padding:14px;margin-bottom:10px;background:var(--w);}.otop{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;}.oid{font-weight:700;font-size:13px;}.odate{font-size:11px;color:var(--t3);}.oitms{font-size:11.5px;color:var(--t2);margin-bottom:8px;line-height:1.5;}.obot{display:flex;align-items:center;justify-content:space-between;}.otot{font-weight:700;color:var(--ac);font-size:14px;}
.robtn{padding:8px 14px;border-radius:var(--rx);border:1.5px solid var(--ac);background:0;color:var(--ac);font-size:12px;font-weight:600;transition:all .15s;display:flex;align-items:center;gap:4px;-webkit-tap-highlight-color:transparent;}.robtn:hover,.robtn:active{background:var(--ac);color:white;}
.lbar{height:10px;background:var(--bl);border-radius:5px;overflow:hidden;}.lfill{height:100%;background:linear-gradient(90deg,var(--ac),#ff9966);border-radius:5px;transition:width .5s;}
.rwb{padding:12px 24px;border:none;border-radius:var(--rs);background:linear-gradient(135deg,var(--ac),#ff7043);color:white;font-size:14px;font-weight:700;transition:all .15s;box-shadow:0 4px 12px rgba(232,93,58,.25);-webkit-tap-highlight-color:transparent;}.rwb:hover{transform:translateY(-1px);}.rwb:disabled{opacity:.5;cursor:not-allowed;transform:none;}
.alay{display:grid;grid-template-columns:210px 1fr;min-height:calc(100vh - 58px);}.asid{background:var(--w);border-right:1px solid var(--bl);padding:18px 12px;}.asit{font-size:9.5px;color:var(--t3);text-transform:uppercase;letter-spacing:2px;margin-bottom:12px;padding:0 7px;font-weight:600;}
.ani{display:flex;align-items:center;gap:9px;padding:8px 11px;border-radius:var(--rs);border:none;background:0;color:var(--t2);font-size:12.5px;width:100%;text-align:left;margin-bottom:2px;transition:all .12s;font-weight:500;}.ani:hover{background:var(--bg);color:var(--t);}.ani.a{background:var(--as);color:var(--ac);}
.acnt{padding:24px;overflow-y:auto;}.ahdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;}.atit{font-family:var(--fd);font-size:24px;font-weight:700;}
.sgr{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px;margin-bottom:24px;}.skk{background:var(--w);border:1px solid var(--bl);border-radius:var(--r);padding:16px;}.skl{font-size:10px;color:var(--t3);text-transform:uppercase;letter-spacing:.7px;margin-bottom:5px;font-weight:600;}.skv{font-size:24px;font-weight:800;}
.tbl{width:100%;border-collapse:separate;border-spacing:0;background:var(--w);border-radius:var(--r);border:1px solid var(--bl);overflow:hidden;}.tbl thead th{text-align:left;padding:10px 13px;font-size:9.5px;text-transform:uppercase;letter-spacing:.7px;color:var(--t3);border-bottom:1px solid var(--bl);font-weight:600;background:#faf9f5;}.tbl tbody td{padding:11px 13px;font-size:12.5px;border-bottom:1px solid var(--bl);vertical-align:middle;}.tbl tbody tr:last-child td{border-bottom:0;}.tbl tbody tr:hover{background:var(--bg);}
.sb{display:inline-block;padding:3px 9px;border-radius:5px;font-size:10.5px;font-weight:600;}.s1{background:var(--as);color:var(--ac);}.s2{background:var(--ys);color:var(--yl);}.s3{background:var(--gs);color:var(--gr);}.s4{background:var(--bg);color:var(--t3);}.s5{background:var(--rds);color:var(--rd);}
.abt{padding:4px 9px;border-radius:var(--rx);border:1px solid var(--bd);background:var(--w);color:var(--t2);font-size:10.5px;transition:all .12s;margin-right:3px;}.abt:hover{border-color:var(--ac);color:var(--ac);}.abt.dng:hover{border-color:var(--rd);color:var(--rd);}
.tsw{position:relative;display:inline-block;width:38px;height:20px;}.tsw input{opacity:0;width:0;height:0;}.tsl{position:absolute;inset:0;cursor:pointer;border-radius:10px;background:var(--bd);transition:.3s;}.tsl::before{content:'';position:absolute;top:2.5px;left:2.5px;width:15px;height:15px;border-radius:50%;background:white;transition:.3s;}.tsw input:checked+.tsl{background:var(--gr);}.tsw input:checked+.tsl::before{transform:translateX(18px);}
.srb{display:flex;align-items:center;gap:7px;padding:8px 13px;background:var(--w);border:1px solid var(--bd);border-radius:var(--rs);margin-bottom:12px;}.srb input{flex:1;border:0;background:0;color:var(--t);font-size:13px;outline:0;}.srb input::placeholder{color:var(--t4);}
.pfg{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;}.pfg .fw{grid-column:1/-1;}
.pnl{max-width:600px;margin:36px auto;padding:0 16px;}.crd{background:var(--w);border:1px solid var(--bl);border-radius:var(--r);padding:20px;box-shadow:0 1px 3px rgba(0,0,0,.04);}
.bk{background:0;border:0;color:var(--ac);font-size:13px;font-weight:600;margin-bottom:14px;display:flex;align-items:center;gap:3px;-webkit-tap-highlight-color:transparent;}
.ftr{background:var(--w);border-top:1px solid var(--bl);padding:36px 20px;text-align:center;}.ftrb{font-family:var(--fd);font-size:20px;font-weight:700;margin-bottom:5px;}.ftri{font-size:11.5px;color:var(--t3);line-height:1.8;}.ftrc{margin-top:18px;padding-top:18px;border-top:1px solid var(--bl);font-size:10px;color:var(--t4);}
.tc{position:fixed;bottom:18px;left:50%;transform:translateX(-50%);z-index:500;display:flex;flex-direction:column;gap:5px;align-items:center;}.toa{background:var(--t);color:white;border-radius:24px;padding:10px 20px;font-size:13px;box-shadow:var(--sl);animation:su .3s;display:flex;align-items:center;gap:8px;white-space:nowrap;}@keyframes su{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
.optgrid{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;}.optchip{padding:6px 12px;border-radius:18px;border:1.5px solid var(--bd);background:var(--w);font-size:12px;font-weight:500;color:var(--t2);cursor:pointer;transition:all .15s;display:flex;align-items:center;gap:4px;-webkit-tap-highlight-color:transparent;}.optchip:hover,.optchip:active{border-color:var(--ac);}.optchip.sel{border-color:var(--ac);background:var(--as);color:var(--ac);}
.optprice{font-size:10px;color:var(--t3);font-weight:600;}
.imgprev{width:100%;height:120px;object-fit:cover;border-radius:var(--rs);margin-top:6px;border:1px solid var(--bl);}
.setcard{background:var(--w);border:1px solid var(--bl);border-radius:var(--r);padding:20px;margin-bottom:16px;}.setlbl{font-size:11px;font-weight:600;color:var(--t2);text-transform:uppercase;letter-spacing:.7px;margin-bottom:10px;}
.txta{width:100%;padding:10px 14px;border:1.5px solid var(--bd);border-radius:var(--rs);background:var(--w);color:var(--t);font-size:14px;resize:vertical;min-height:60px;font-family:var(--fb);transition:border-color .15s;}.txta:focus{outline:0;border-color:var(--ac);}
@media(max-width:768px){
  .bnav{display:flex !important;}body{padding-bottom:calc(60px + env(safe-area-inset-bottom,0px));}.tb{height:52px;padding:0 14px;}.tbr .tblogo{width:32px;height:32px;font-size:14px;}.tbn{font-size:13px;}.tnv .lbl,.tsp,.tnv .tlk,.tnv .ub{display:none;}.tnv{gap:0;}
  .hero{padding:28px 16px 24px;}.hero::before{width:350px;height:350px;top:-60px;}.hbd{font-size:10.5px;padding:4px 12px;margin-bottom:12px;}.hti{font-size:28px;margin-bottom:8px;letter-spacing:-.5px;}.hds{font-size:13px;margin-bottom:18px;}.hbt{padding:12px 24px;font-size:13.5px;border-radius:12px;width:100%;justify-content:center;}.hin{gap:10px;margin-top:14px;}.hin span{font-size:11px;}
  .cn{top:52px;padding:8px 12px;gap:5px;}.cc{padding:6px 13px;font-size:12px;border-radius:18px;}.ms{padding:20px 12px;}.shd{margin-bottom:12px;padding-bottom:8px;}.stt{font-size:18px;}
  .pg{grid-template-columns:1fr;gap:10px;}.pc{flex-direction:row;padding:12px;gap:12px;align-items:stretch;}.pc .pimg{width:90px;height:90px;min-width:90px;border-radius:10px;margin-bottom:0;flex-shrink:0;}.pc .pop{top:6px;right:6px;font-size:7.5px;padding:2px 5px;}.pc .pn{font-size:13px;padding-right:0;}.pc .pde{font-size:11px;margin-bottom:4px;-webkit-line-clamp:2;}.pc .pfo{margin-top:auto;}.pc .pp{font-size:15px;}.pc .pp small{font-size:11px;}.pc .addb{width:34px;height:34px;font-size:16px;}.pc-body{display:flex;flex-direction:column;flex:1;min-width:0;}
  .pnl{margin:20px auto;padding:0 12px;}.crd{padding:16px;border-radius:12px;}.acch{gap:10px;margin-bottom:18px;}.accav{width:44px;height:44px;font-size:18px;}.accn{font-size:17px;}.accs{gap:6px;margin-bottom:16px;}.accst{padding:10px 4px;}.accv{font-size:16px;}.accl{font-size:8px;}.atabs{margin-bottom:16px;}.atab{padding:8px 4px;font-size:11.5px;}.ocard{padding:12px;}.robtn{padding:7px 12px;font-size:11px;}
  .md{width:min(460px,95vw);padding:20px;border-radius:16px;max-height:92vh;}.mt{font-size:17px;margin-bottom:14px;}.mop{padding:12px 14px;gap:10px;}.ftr{padding:28px 16px 80px;}.tc{bottom:72px;}
  .alay{grid-template-columns:1fr;}.asid{display:none;}.sgr{grid-template-columns:1fr 1fr;}.pfg{grid-template-columns:1fr;}.acnt{padding:16px;}.tbl{font-size:11px;}.tbl thead th{padding:8px 10px;}.tbl tbody td{padding:8px 10px;font-size:11px;}
}
@media(max-width:380px){.pc .pimg{width:75px;height:75px;min-width:75px;}.hero{padding:22px 12px 20px;}.hti{font-size:24px;}.accs{grid-template-columns:repeat(3,1fr);}}
`;

function CheckoutForm({cart,orderMode,user,profile,cartTotal,waitTime,isOpenNow,onClose,onSubmit,onSignup}){
  const [f,sF]=useState({name:profile?.name||"",phone:profile?.phone||"",notes:""});
  const md=MODES.find(m=>m.id===orderMode);
  return(<div className="ov" onClick={onClose}><div className="md" onClick={e=>e.stopPropagation()}>
    <h2 className="mt">Finaliser la commande</h2>
    {md&&<div className="cmtag" style={{margin:"0 0 14px"}}><span>{md.icon}</span>{md.label}</div>}
    {waitTime>0&&<div style={{background:"var(--ys)",color:"var(--yl)",padding:"8px 12px",borderRadius:"var(--rs)",fontSize:12,fontWeight:600,marginBottom:14,display:"flex",alignItems:"center",gap:6}}>Temps d attente estime : ~{waitTime} min</div>}
    {!isOpenNow&&<div style={{background:"var(--rds)",color:"var(--rd)",padding:"8px 12px",borderRadius:"var(--rs)",fontSize:12,fontWeight:600,marginBottom:14}}>Restaurant fermé — commande disponible 15 min après la prochaine ouverture</div>}
    {profile&&<div style={{background:"var(--gs)",color:"var(--gr)",padding:"5px 10px",borderRadius:"var(--rs)",fontSize:11,fontWeight:500,marginBottom:14,display:"inline-flex",alignItems:"center",gap:5}}>Connecte: {profile.name}</div>}
    <div className="fg"><label className="fl">Nom *</label><input className="fi" value={f.name} onChange={e=>sF({...f,name:e.target.value})} placeholder="Votre nom"/></div>
    <div className="fg"><label className="fl">Telephone *</label><input className="fi" value={f.phone} onChange={e=>sF({...f,phone:e.target.value})} placeholder="06..."/></div>
    <div className="fg"><label className="fl">Notes</label><input className="fi" value={f.notes} onChange={e=>sF({...f,notes:e.target.value})} placeholder="Instructions, allergies..."/></div>
    <div style={{background:"#faf9f5",borderRadius:"var(--rs)",padding:12,margin:"12px 0"}}>
      {cart.map(i=><div key={i._key} style={{display:"flex",justifyContent:"space-between",fontSize:11.5,padding:"2px 0",color:"var(--t2)"}}><span>{i.qty}x {i.name}{i.selectedOpts?.length>0&&<span style={{color:"var(--pu)"}}> ({i.selectedOpts.map(o=>o.name).join(", ")})</span>}</span><span>{(i.unitPrice*i.qty).toFixed(2)}E</span></div>)}
      <div style={{display:"flex",justifyContent:"space-between",fontSize:14,fontWeight:700,paddingTop:8,borderTop:"1px solid var(--bl)",marginTop:5}}><span>Total</span><span style={{color:"var(--ac)"}}>{cartTotal.toFixed(2)}E</span></div>
      {profile&&<div style={{fontSize:11,color:"var(--gr)",marginTop:4}}>+{Math.floor(cartTotal)} points</div>}
    </div>
    {!user&&<div style={{background:"var(--ps)",borderRadius:"var(--rs)",padding:"10px 14px",marginBottom:10,fontSize:11.5,color:"var(--pu)"}}>Creez un compte pour gagner {Math.floor(cartTotal)} pts ! <button style={{background:"none",border:"none",color:"var(--pu)",fontWeight:700,textDecoration:"underline",cursor:"pointer",fontSize:11.5}} onClick={onSignup}>S inscrire</button></div>}
    <div className="fxa"><button className="gbtn" onClick={onClose}>Annuler</button><button className="pbtn" onClick={()=>{if(f.name&&f.phone)onSubmit(f);}}>Confirmer</button></div>
  </div></div>);
}

export default function App(){
  const {user,profile,isAdmin,loading:authLoading,login,loginWithGoogle,register,logout,addPoints,redeemPoints}=useAuth();
  const {products,loading:prodsLoading,updateProduct,addProduct,deleteProduct}=useProducts();
  const {orders,loading:ordsLoading,createOrder,updateStatus}=useOrders();
  const {config:cfg,loading:cfgLoading,updateConfig,checkOpen}=useConfig();

  const [page,setPage]=useState("menu");const [view,setView]=useState("user");
  const [cart,setCart]=useState([]);const [cartOpen,setCartOpen]=useState(false);
  const [modeModal,setModeModal]=useState(false);const [orderMode,setOrderMode]=useState(null);
  const [checkoutOpen,setCheckoutOpen]=useState(false);const [confirmation,setConfirmation]=useState(null);
  const [activeCat,setActiveCat]=useState("all");const [adminTab,setAdminTab]=useState("dashboard");
  const [toasts,setToasts]=useState([]);const [editing,setEditing]=useState(null);
  const [search,setSearch]=useState("");const [catF,setCatF]=useState("all");const [orderFilter,setOrderFilter]=useState("all");
  const [authModal,setAuthModal]=useState(false);const [authTab,setAuthTab]=useState("login");
  const [af,setAf]=useState({name:"",email:"",phone:"",pw:"",birthday:""});const [authErr,setAuthErr]=useState("");
  const [accTab,setAccTab]=useState("orders");
  const [detailProduct,setDetailProduct]=useState(null);const [selOpts,setSelOpts]=useState({});
  const [welcomeEdit,setWelcomeEdit]=useState(null);
  const [adminLoginModal,setAdminLoginModal]=useState(false);const [adminEmail,setAdminEmail]=useState("");const [adminPw,setAdminPw]=useState("");const [adminErr,setAdminErr]=useState("");

  const isOpen=checkOpen();const wlc=cfg.welcome||{title:"Poké & Tea",subtitle:"",badge:""};
  const cnt=cart.reduce((s,i)=>s+i.qty,0);const cartTotal=cart.reduce((s,i)=>s+i.unitPrice*i.qty,0);
  const toast=useCallback((e,t)=>{const id=Date.now();setToasts(x=>[...x,{id,emoji:e,text:t}]);setTimeout(()=>setToasts(x=>x.filter(z=>z.id!==id)),2500);},[]);

  const loading=authLoading||prodsLoading||cfgLoading;
  if(loading)return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",gap:12}}><div style={{fontSize:48}}>🍣</div><div style={{fontSize:14,color:"#999"}}>Chargement...</div></div>);

  const hasOptionGroups=p=>p.optionGroups&&p.optionGroups.length>0;
  const handleAdd=p=>{if(!user){setAuthModal(true);setAuthTab("register");setAuthErr("");return;}if(!orderMode){setModeModal(true);return;}if(hasOptionGroups(p)){setDetailProduct(p);setSelOpts({});return;}const key=p.id;const e=cart.find(i=>i._key===key);if(e){setCart(cart.map(i=>i._key===key?{...i,qty:i.qty+1}:i));}else{setCart([...cart,{...p,_key:key,qty:1,selectedOpts:[],optSelections:{},unitPrice:p.price}]);}toast("OK",p.name+" ajoute");};

  const optsTotal=()=>{if(!detailProduct)return 0;let t=0;(detailProduct.optionGroups||[]).forEach(g=>{const sel=selOpts[g.name]||[];g.options.forEach(o=>{if(sel.includes(o.id))t+=o.price;});});return t;};
  const canAddToCart=()=>{if(!detailProduct)return false;for(const g of(detailProduct.optionGroups||[])){if(g.required){const sel=(selOpts[g.name]||[]).length;if(sel<g.min)return false;}}return true;};
  const handleAddWithOpts=()=>{if(!detailProduct||!canAddToCart())return;const skey=Object.entries(selOpts).sort().map(([g,ids])=>g+":"+ids.sort().join(",")).join("|");const key=detailProduct.id+"_"+skey;let optTotal=0;const flatOpts=[];(detailProduct.optionGroups||[]).forEach(g=>{const sel=selOpts[g.name]||[];g.options.forEach(o=>{if(sel.includes(o.id)){optTotal+=o.price;flatOpts.push({...o,group:g.name});}});});const e=cart.find(i=>i._key===key);if(e){setCart(cart.map(i=>i._key===key?{...i,qty:i.qty+1}:i));}else{setCart([...cart,{...detailProduct,_key:key,qty:1,selectedOpts:flatOpts,optSelections:selOpts,unitPrice:detailProduct.price+optTotal}]);}toast("OK",detailProduct.name+" ajoute");setDetailProduct(null);setSelOpts({});};
  const toggleOpt=(gName,oId,max)=>{setSelOpts(prev=>{const cur=prev[gName]||[];if(cur.includes(oId))return{...prev,[gName]:cur.filter(x=>x!==oId)};if(max&&cur.length>=max)return max===1?{...prev,[gName]:[oId]}:{...prev};return{...prev,[gName]:[...cur,oId]};});};

  const handleSubmit=async(f)=>{const cust=profile?{name:profile.name,phone:profile.phone||f.phone,email:profile.email,...f}:f;const items=cart.map(i=>({id:i.id,name:i.name,qty:i.qty,unitPrice:i.unitPrice,selectedOpts:i.selectedOpts||[]}));try{const result=await createOrder({items,customer:cust,orderMode,total:cartTotal});if(profile)await addPoints(Math.floor(cartTotal),cartTotal);setCheckoutOpen(false);setCart([]);setConfirmation({...result,customer:cust,total:cartTotal,orderMode});toast("*","Commande envoyee !");}catch(e){toast("X","Erreur: "+e.message);}};

  const handleReg=async()=>{if(!af.name||!af.email||!af.pw){setAuthErr("Remplissez tous les champs obligatoires");return;}try{await register(af.email,af.pw,{name:af.name,phone:af.phone,birthday:af.birthday});setAuthModal(false);setAf({name:"",email:"",phone:"",pw:"",birthday:""});setAuthErr("");toast("OK","Bienvenue !");}catch(e){setAuthErr(e.message);}};
  const handleLog=async()=>{try{await login(af.email,af.pw);setAuthModal(false);setAf({name:"",email:"",phone:"",pw:"",birthday:""});setAuthErr("");toast("OK","Bon retour !");}catch{setAuthErr("Email ou mot de passe incorrect");}};

  const myOrders=orders.filter(o=>user&&o.customer?.email===profile?.email);
  const handleReorder=(o)=>{if(!orderMode)setOrderMode("emporter");const nc=(o.items||[]).map(i=>{const pr=products.find(p=>p.id===i.id);return pr&&pr.available!==false?{...pr,qty:i.qty,_key:i.id+"_ro_"+Date.now(),unitPrice:i.unitPrice||pr.price,selectedOpts:i.selectedOpts||[],optSelections:{}}:null;}).filter(Boolean);if(!nc.length){toast("X","Produits indisponibles");return;}setCart(nc);toast("OK","Commande rechargée !");setPage("menu");setCartOpen(true);};
  const groups=()=>{let p=products.filter(x=>x.available!==false);if(activeCat==="popular")p=p.filter(x=>x.popular);else if(activeCat!=="all")p=p.filter(x=>x.category===activeCat);if(activeCat!=="all"&&activeCat!=="popular"){const c=CATEGORIES.find(x=>x.id===activeCat);return[{cat:c,products:p}];}if(activeCat==="popular")return[{cat:{id:"popular",name:"Populaires",emoji:"🔥"},products:p}];return CATEGORIES.map(c=>({cat:c,products:p.filter(x=>x.category===c.id)})).filter(g=>g.products.length>0);};
  const rev=orders.filter(o=>o.status!=="annulée").reduce((s,o)=>s+(o.total||0),0);
  const fOrds=orderFilter==="all"?orders:orders.filter(o=>o.status===orderFilter);
  const fPrds=products.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())&&(catF==="all"||p.category===catF));

  return(<><style>{CSS}</style><div>
    {/* TOPBAR */}
    <div className="tb"><div className="tbr" onClick={()=>{setView("user");setPage("menu");}}><div className="tblogo">🍣</div><div><div className="tbn">Poké Tea</div><span className={"tbs "+(isOpen?"op":"cl")}>{isOpen?"Ouvert":"Fermé"}</span></div></div>
      <div className="tnv">
        <button className={"tlk "+(view==="user"&&page==="menu"?"a":"")} onClick={()=>{setView("user");setPage("menu");}}><span>🍽</span><span className="lbl">Menu</span></button>
        <span style={{fontSize:12,color:"var(--t2)",display:"flex",alignItems:"center",gap:3,padding:"0 6px",whiteSpace:"nowrap"}}>📞 <span className="lbl">01 60 25 25 63</span></span><div className="tsp"/>
        <button className={"tlk "+(page==="loyalty"||page==="account"?"a":"")} onClick={()=>{setView("user");setPage(user?"account":"loyalty");if(user)setAccTab("loyalty");}}><span>⭐</span><span className="lbl">Fidélité</span></button><div className="tsp"/>
        {view==="user"&&<button className="tcart" onClick={()=>setCartOpen(true)}>🛒 <span className="lbl">Panier</span>{cnt>0&&<span className="tcb">{cnt}</span>}</button>}<div className="tsp"/>
        {user?(<button className="ub" onClick={()=>{setView("user");setPage("account");setAccTab("orders");}}><div className="uav">{(profile?.name||"U")[0].toUpperCase()}</div><span className="lbl">{(profile?.name||"").split(" ")[0]}</span></button>
        ):(<button className="ub" onClick={()=>{setAuthModal(true);setAuthTab("login");setAuthErr("");}}><span>👤</span><span className="lbl">Connexion</span></button>)}
      </div></div>

    {/* AUTH MODAL */}
    {authModal&&<div className="ov" onClick={()=>setAuthModal(false)}><div className="md" onClick={e=>e.stopPropagation()} style={{maxWidth:400}}>
      <div className="atabs"><button className={"atab "+(authTab==="login"?"a":"")} onClick={()=>{setAuthTab("login");setAuthErr("");}}>Connexion</button><button className={"atab "+(authTab==="register"?"a":"")} onClick={()=>{setAuthTab("register");setAuthErr("");}}>Créer un compte</button></div>
      {authErr&&<div style={{background:"var(--rds)",color:"var(--rd)",padding:"8px 12px",borderRadius:"var(--rs)",fontSize:12,fontWeight:500,marginBottom:14}}>{authErr}</div>}
      {authTab==="login"?(<>
        <div className="fg"><label className="fl">Email</label><input className="fi" type="email" value={af.email} onChange={e=>setAf({...af,email:e.target.value})} placeholder="votre@email.com"/></div>
        <div className="fg"><label className="fl">Mot de passe</label><input className="fi" type="password" value={af.pw} onChange={e=>setAf({...af,pw:e.target.value})} placeholder="********"/></div>
        <button className="pbtn" style={{width:"100%",padding:12}} onClick={handleLog}>Se connecter</button>
        <div className="orsep">ou</div>
        <button className="gbtn" style={{width:"100%",padding:10,textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center",gap:8}} onClick={async()=>{try{await loginWithGoogle();setAuthModal(false);toast("OK","Bienvenue !");}catch(e){setAuthErr(e.message);}}}><svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#34A853" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#FBBC05" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>Continuer avec Google</button>
        <div className="orsep">ou</div>
        <button className="gbtn" style={{width:"100%",padding:10,textAlign:"center"}} onClick={()=>{setAuthTab("register");setAuthErr("");}}>Créer un compte</button>
      </>):(<>
        <div className="fg"><label className="fl">Nom complet *</label><input className="fi" value={af.name} onChange={e=>setAf({...af,name:e.target.value})} placeholder="Jean Dupont"/></div>
        <div className="fg"><label className="fl">Email *</label><input className="fi" type="email" value={af.email} onChange={e=>setAf({...af,email:e.target.value})} placeholder="votre@email.com"/></div>
        <div className="fg"><label className="fl">Téléphone</label><input className="fi" value={af.phone} onChange={e=>setAf({...af,phone:e.target.value})} placeholder="06..."/></div>
        <div className="fg"><label className="fl">Mot de passe *</label><input className="fi" type="password" value={af.pw} onChange={e=>setAf({...af,pw:e.target.value})} placeholder="Min. 6 caractères"/></div>
        <div className="fg"><label className="fl">Anniversaire</label><input className="fi" type="date" value={af.birthday} onChange={e=>setAf({...af,birthday:e.target.value})}/></div>
        <button className="pbtn" style={{width:"100%",padding:12}} onClick={handleReg}>Créer mon compte</button>
        <div className="orsep">ou</div>
        <button className="gbtn" style={{width:"100%",padding:10,textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center",gap:8}} onClick={async()=>{try{await loginWithGoogle();setAuthModal(false);toast("OK","Bienvenue !");}catch(e){setAuthErr(e.message);}}}><svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#34A853" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#FBBC05" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>Continuer avec Google</button>
      </>)}
    </div></div>}

    {/* MENU PAGE */}
    {view==="user"&&page==="menu"&&(<>
      <section className="hero"><div className="hbd">{wlc.badge}</div><h1 className="hti">{wlc.title.includes("&")?<>{wlc.title.split("&")[0]}<span>&amp;</span>{wlc.title.split("&")[1]}</>:wlc.title}</h1><p className="hds">{wlc.subtitle}</p>
        {isOpen?(<>
          <button className="hbt" onClick={()=>{if(!user){setAuthModal(true);setAuthTab("register");setAuthErr("");return;}setModeModal(true);}}>🛒 Commander maintenant</button>
          {cfg.waitTime>0&&<p style={{fontSize:12,color:"var(--t2)",marginTop:10}}>Temps d attente : ~{cfg.waitTime} min</p>}
        </>):(<>
          <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"10px 20px",borderRadius:"var(--rs)",background:"var(--rds)",color:"var(--rd)",fontSize:13,fontWeight:600,marginBottom:12}}>Fermé actuellement</div>
          <button className="hbt" style={{background:"var(--t2)"}} onClick={()=>{if(!user){setAuthModal(true);setAuthTab("register");setAuthErr("");return;}setModeModal(true);}}>🛒 Précommander</button>
          <p style={{fontSize:11.5,color:"var(--yl)",marginTop:8,fontWeight:500}}>Votre commande sera disponible 15 min après la prochaine ouverture</p>
        </>)}
        {(cfg.uberEatsUrl||cfg.deliverooUrl)&&<div style={{display:"flex",gap:10,justifyContent:"center",marginTop:14,flexWrap:"wrap"}}>
          {cfg.uberEatsUrl&&<a href={cfg.uberEatsUrl} target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:6,padding:"9px 18px",borderRadius:"var(--rs)",background:"#06C167",color:"white",fontSize:12.5,fontWeight:600,textDecoration:"none"}}>Uber Eats</a>}
          {cfg.deliverooUrl&&<a href={cfg.deliverooUrl} target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:6,padding:"9px 18px",borderRadius:"var(--rs)",background:"#00CCBC",color:"white",fontSize:12.5,fontWeight:600,textDecoration:"none"}}>Deliveroo</a>}
        </div>}
        {profile&&<p style={{fontSize:12,color:"var(--ac)",marginTop:12,fontWeight:600}}>Bonjour {profile.name.split(" ")[0]} ! {profile.points||0} points</p>}
        <div className="hin"><span>17 Rue Cornillon, Meaux</span><span>01 60 25 25 63</span></div>
      </section>
      <nav className="cn"><button className={"cc "+(activeCat==="all"?"a":"")} onClick={()=>setActiveCat("all")}>Tout</button><button className={"cc "+(activeCat==="popular"?"a":"")} onClick={()=>setActiveCat("popular")}>Populaires</button>{CATEGORIES.map(c=><button key={c.id} className={"cc "+(activeCat===c.id?"a":"")} onClick={()=>setActiveCat(c.id)}>{c.emoji} {c.name}</button>)}</nav>
      {groups().map(g=>(<section key={g.cat.id} className="ms"><div className="shd"><span className="se">{g.cat.emoji}</span><h2 className="stt">{g.cat.name}</h2><span className="sct">{g.products.length}</span></div>
        <div className="pg">{g.products.map(p=>(<div key={p.id} className={"pc "+(p.available===false?"off":"")}>{p.popular&&<span className="pop">Populaire</span>}{p.image?<img style={{width:"100%",height:150,objectFit:"cover",borderRadius:10,marginBottom:10,background:"var(--bl)"}} src={p.image} alt={p.name}/>:null}<div className="pc-body"><div className="pn">{p.name}</div><div className="pde">{p.description}</div>{hasOptionGroups(p)&&<div style={{fontSize:10.5,color:"var(--pu)",fontWeight:500,marginBottom:4}}>Options disponibles</div>}<div className="pfo"><span className="pp">{p.price.toFixed(2)}<small>E</small></span><button className="addb" onClick={()=>handleAdd(p)}>+</button></div></div></div>))}</div>
      </section>))}
      <footer className="ftr"><div className="ftrb">Poké Tea</div><div className="ftri">17 Rue Cornillon, 77100 Meaux - 01 60 25 25 63</div><div className="ftrc"><span>2026 Poké Tea</span> <span style={{cursor:"pointer",userSelect:"none"}} onClick={()=>{if(view==="admin")return;if(isAdmin){setView("admin");setAdminTab("dashboard");}else{setAdminLoginModal(true);setAdminErr("");}}}>.</span></div></footer>
    </>)}

    {/* ACCOUNT */}
    {view==="user"&&page==="account"&&user&&profile&&(<div className="pnl"><button className="bk" onClick={()=>setPage("menu")}>&#8592; Retour</button><div className="crd">
      <div className="acch"><div className="accav">{profile.name[0].toUpperCase()}</div><div><div className="accn">{profile.name}</div><div className="acce">{profile.email}</div></div>
        <button className="gbtn" style={{marginLeft:"auto",padding:"6px 12px",fontSize:11}} onClick={()=>{logout();setPage("menu");toast("OK","A bientot !");}}>Déconnexion</button></div>
      <div className="accs">
        <div className="accst"><div className="accv" style={{color:"var(--ac)"}}>{profile.points||0}</div><div className="accl">Points</div></div>
        <div className="accst"><div className="accv">{profile.orderCount||0}</div><div className="accl">Commandes</div></div>
        <div className="accst"><div className="accv" style={{color:"var(--gr)"}}>{(profile.totalSpent||0).toFixed(0)}E</div><div className="accl">Dépensé</div></div>
      </div>
      <div className="atabs">
        <button className={"atab "+(accTab==="orders"?"a":"")} onClick={()=>setAccTab("orders")}>Commandes</button>
        <button className={"atab "+(accTab==="loyalty"?"a":"")} onClick={()=>setAccTab("loyalty")}>Fidélité</button>
        <button className={"atab "+(accTab==="info"?"a":"")} onClick={()=>setAccTab("info")}>Infos</button>
      </div>
      {accTab==="orders"&&(<div>{myOrders.length===0?(<div style={{textAlign:"center",padding:"36px 0",color:"var(--t3)"}}><div style={{fontSize:42,marginBottom:8}}>📦</div><div style={{fontSize:14,fontWeight:500}}>Aucune commande</div><button className="pbtn" style={{marginTop:16,padding:"10px 24px"}} onClick={()=>setPage("menu")}>Commander</button></div>
      ):(myOrders.map(o=>(<div key={o.id} className="ocard"><div className="otop"><span className="oid">{o.orderNum||o.id.slice(0,8)}</span><span className={"sb "+stc(o.status)}>{o.status}</span></div><div className="odate">{fd(o.createdAt)} - {o.orderMode==="emporter"?"🥡 A emporter":o.orderMode==="surplace"?"🍽 Sur place":o.orderMode||""}</div><div className="oitms">{(o.items||[]).map(i=>i.qty+"x "+i.name).join(" — ")}</div><div className="obot"><span className="otot">{(o.total||0).toFixed(2)}€</span><button className="robtn" onClick={()=>handleReorder(o)}>🔄 Recommander</button></div></div>)))}</div>)}
      {accTab==="loyalty"&&(<div style={{textAlign:"center"}}><div style={{fontSize:42,marginBottom:8}}>⭐</div><div style={{fontSize:28,fontWeight:800,color:"var(--ac)",marginBottom:2}}>{profile.points||0} pts</div><div style={{fontSize:12,color:"var(--t3)",marginBottom:14}}>sur 100 pts pour une recompense</div>
        <div className="lbar"><div className="lfill" style={{width:Math.min(profile.points||0,100)+"%"}}/></div>
        <div style={{fontSize:11,color:"var(--t4)",marginTop:4,marginBottom:18}}>{(profile.points||0)>=100?"Vous pouvez utiliser vos points !":"Encore "+(100-(profile.points||0))+" points"}</div>
        <button className="rwb" disabled={(profile.points||0)<100} onClick={async()=>{const ok=await redeemPoints();if(ok)toast("OK","5E de reduction !");}}>
          {(profile.points||0)>=100?"Utiliser 100 pts = -5E":"Continuez a commander !"}
        </button>
        <div style={{height:1,background:"var(--bl)",margin:"20px 0"}}/>
        <div style={{textAlign:"left"}}><div style={{fontSize:13,fontWeight:600,marginBottom:10}}>Comment ca marche :</div>
          {RULES.map((r,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:9,padding:"7px 0",borderBottom:"1px solid var(--bl)",fontSize:12.5,color:"var(--t2)"}}><span style={{fontSize:16}}>{r.i}</span><span>{r.t}</span></div>))}
        </div>
      </div>)}
      {accTab==="info"&&(<div>
        <div className="fg"><label className="fl">Nom</label><div className="fi" style={{background:"var(--bg)"}}>{profile.name}</div></div>
        <div className="fg"><label className="fl">Email</label><div className="fi" style={{background:"var(--bg)"}}>{profile.email}</div></div>
        <div className="fg"><label className="fl">Téléphone</label><div className="fi" style={{background:"var(--bg)"}}>{profile.phone||"Non renseigné"}</div></div>
        <div className="fg"><label className="fl">Anniversaire</label><div className="fi" style={{background:"var(--bg)"}}>{profile.birthday||"Non renseigné"}</div></div>
      </div>)}
    </div></div>)}

    {/* LOYALTY (not logged in) */}
    {view==="user"&&page==="loyalty"&&!user&&(<div className="pnl"><button className="bk" onClick={()=>setPage("menu")}>&#8592; Retour</button><div className="crd" style={{textAlign:"center"}}>
      <div style={{fontSize:48,marginBottom:10}}>⭐</div><div style={{fontFamily:"var(--fd)",fontSize:20,fontWeight:700,marginBottom:6}}>Programme de fidélité</div>
      <p style={{fontSize:13,color:"var(--t2)",marginBottom:20}}>Créez un compte pour profiter du programme !</p>
      {RULES.map((r,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:9,padding:"7px 0",borderBottom:"1px solid var(--bl)",fontSize:12.5,color:"var(--t2)",textAlign:"left"}}><span style={{fontSize:16}}>{r.i}</span><span>{r.t}</span></div>))}
      <button className="pbtn" style={{width:"100%",marginTop:20,padding:12}} onClick={()=>{setAuthModal(true);setAuthTab("register");setAuthErr("");}}>Créer un compte</button>
    </div></div>)}


    {/* ADMIN */}
    {view==="admin"&&isAdmin&&(<>
    <div className="tb" style={{background:"rgba(26,26,26,.95)",borderBottom:"1px solid rgba(255,255,255,.1)"}}>
      <div className="tbr" onClick={()=>{setView("user");setPage("menu");}}><div className="tblogo">🍣</div><div><div className="tbn" style={{color:"white"}}>Poké Tea</div><span style={{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:8,background:"rgba(232,93,58,.2)",color:"var(--ac)"}}>ADMIN</span></div></div>
      <div className="tnv">
        <button className="tlk" style={{color:"rgba(255,255,255,.6)"}} onClick={()=>{setView("user");setPage("menu");}}><span>👁</span><span className="lbl">Voir le site</span></button><div className="tsp" style={{background:"rgba(255,255,255,.15)"}}/>
        <button className="tlk" style={{color:"rgba(255,255,255,.6)"}} onClick={()=>{logout();setView("user");setPage("menu");toast("OK","Deconnecte");}}><span>🚪</span><span className="lbl">Déconnexion</span></button>
      </div>
    </div>
    <div className="alay"><aside className="asid"><div className="asit">Administration</div>
      {[{id:"dashboard",ic:"📊",l:"Dashboard"},{id:"orders",ic:"📦",l:"Commandes"},{id:"products",ic:"🍱",l:"Produits"},{id:"settings",ic:"⚙",l:"Réglages"}].map(t=>(
        <button key={t.id} className={"ani "+(adminTab===t.id?"a":"")} onClick={()=>setAdminTab(t.id)}><span>{t.ic}</span><span>{t.l}</span>
          {t.id==="orders"&&orders.filter(o=>o.status==="nouvelle").length>0&&<span style={{marginLeft:"auto",background:"var(--ac)",color:"white",fontSize:8.5,fontWeight:700,padding:"2px 5px",borderRadius:5}}>{orders.filter(o=>o.status==="nouvelle").length}</span>}
        </button>))}
    </aside><main className="acnt">

      {/* DASHBOARD */}
      {adminTab==="dashboard"&&(<div><div className="ahdr"><h1 className="atit">Dashboard</h1></div>
        <div className="sgr"><div className="skk"><div className="skl">Statut</div><div className="skv" style={{color:isOpen?"var(--gr)":"var(--rd)",fontSize:16}}>{isOpen?"Ouvert":"Fermé"}</div></div><div className="skk"><div className="skl">Attente</div><div className="skv" style={{color:"var(--yl)"}}>{cfg.waitTime}min</div></div><div className="skk"><div className="skl">Commandes</div><div className="skv" style={{color:"var(--ac)"}}>{orders.length}</div></div><div className="skk"><div className="skl">CA</div><div className="skv" style={{color:"var(--gr)"}}>{rev.toFixed(0)}E</div></div></div>
        {orders.length>0&&<table className="tbl"><thead><tr><th>No</th><th>Client</th><th>Total</th><th>Statut</th></tr></thead><tbody>{orders.slice(0,10).map(o=>(<tr key={o.id}><td style={{fontWeight:600,fontSize:11}}>{o.orderNum||o.id.slice(0,8)}</td><td>{o.customer?.name}</td><td style={{fontWeight:600,color:"var(--ac)"}}>{(o.total||0).toFixed(2)}E</td><td><span className={"sb "+stc(o.status)}>{o.status}</span></td></tr>))}</tbody></table>}
      </div>)}

      {/* ORDERS */}
      {adminTab==="orders"&&(<div><div className="ahdr"><h1 className="atit">Commandes</h1></div>
        <div style={{display:"flex",gap:5,marginBottom:18,flexWrap:"wrap"}}>{["all",...STATUSES].map(s=><button key={s} className={"cc "+(orderFilter===s?"a":"")} onClick={()=>setOrderFilter(s)}>{s==="all"?"Toutes":s}</button>)}</div>
        {fOrds.length===0?<div style={{textAlign:"center",padding:36,color:"var(--t3)"}}>Aucune commande</div>:
        <table className="tbl"><thead><tr><th>No</th><th>Client</th><th>Articles</th><th>Total</th><th>Statut</th><th>Actions</th></tr></thead><tbody>{fOrds.map(o=>(<tr key={o.id}><td style={{fontWeight:600,fontSize:11}}>{o.orderNum||o.id.slice(0,8)}</td><td><div style={{fontSize:12.5}}>{o.customer?.name}</div><div style={{fontSize:10,color:"var(--t3)"}}>{o.customer?.phone||""} - {o.orderMode||""}</div></td><td style={{fontSize:10.5,color:"var(--t2)",maxWidth:170}}>{(o.items||[]).map(i=>i.qty+"x "+i.name).join(", ")}</td><td style={{fontWeight:600,color:"var(--ac)"}}>{(o.total||0).toFixed(2)}E</td><td><span className={"sb "+stc(o.status)}>{o.status}</span></td><td><select className="fi" value={o.status} onChange={e=>updateStatus(o.id,e.target.value)} style={{width:"auto",padding:"4px 7px",fontSize:10.5}}>{STATUSES.map(s=><option key={s} value={s}>{s}</option>)}</select></td></tr>))}</tbody></table>}
      </div>)}

      {/* PRODUCTS */}
      {adminTab==="products"&&(<div><div className="ahdr"><h1 className="atit">Produits ({products.length})</h1><button className="pbtn" style={{padding:"8px 16px"}} onClick={()=>setEditing({name:"",price:0,category:"entrees",description:"",popular:false,available:true,image:"",optionGroups:[]})}>+ Ajouter</button></div>
        <div className="srb"><span>🔍</span><input placeholder="Rechercher..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
        <div style={{display:"flex",gap:4,marginBottom:18,flexWrap:"wrap"}}><button className={"cc "+(catF==="all"?"a":"")} onClick={()=>setCatF("all")}>Tous</button>{CATEGORIES.map(c=><button key={c.id} className={"cc "+(catF===c.id?"a":"")} onClick={()=>setCatF(c.id)}>{c.emoji} {c.name}</button>)}</div>
        <table className="tbl"><thead><tr><th>Produit</th><th>Cat</th><th>Prix</th><th>Statut</th><th>Actions</th></tr></thead><tbody>{fPrds.map(p=>{const cat=CATEGORIES.find(c=>c.id===p.category);return(<tr key={p.id}><td><div style={{fontWeight:500,fontSize:12.5}}>{p.name} {p.popular&&"🔥"}</div><div style={{fontSize:10,color:"var(--t3)",maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.description}</div></td><td style={{fontSize:11.5}}>{cat?.emoji} {cat?.name}</td><td style={{fontWeight:600,color:"var(--ac)"}}>{p.price.toFixed(2)}E</td><td><span className={"sb "+(p.available!==false?"s3":"s5")}>{p.available!==false?"Dispo":"Epuise"}</span></td><td><button className="abt" onClick={()=>setEditing({...p})}>Modifier</button><button className="abt dng" onClick={async()=>{await deleteProduct(p.id);toast("OK","Supprime");}}>Suppr</button></td></tr>);})}</tbody></table>

        {/* PRODUCT EDIT MODAL */}
        {editing&&<div className="ov" onClick={()=>setEditing(null)}><div className="md" onClick={e=>e.stopPropagation()} style={{maxWidth:540}}>
          <h2 className="mt">{editing.id?"Modifier":"Ajouter"} un produit</h2>
          <div className="pfg">
            <div className="fg fw"><label className="fl">Nom</label><input className="fi" value={editing.name} onChange={e=>setEditing({...editing,name:e.target.value})}/></div>
            <div className="fg"><label className="fl">Prix</label><input className="fi" type="number" step="0.1" value={editing.price} onChange={e=>setEditing({...editing,price:parseFloat(e.target.value)||0})}/></div>
            <div className="fg"><label className="fl">Catégorie</label><select className="fi" value={editing.category} onChange={e=>setEditing({...editing,category:e.target.value})}>{CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div className="fg fw"><label className="fl">Description</label><input className="fi" value={editing.description} onChange={e=>setEditing({...editing,description:e.target.value})}/></div>
            <div className="fg fw"><label className="fl">URL photo</label><input className="fi" value={editing.image||""} onChange={e=>setEditing({...editing,image:e.target.value})} placeholder="https://..."/>{editing.image&&<img className="imgprev" src={editing.image} alt="" onError={e=>{e.target.style.display="none"}}/>}</div>
            <div className="fg" style={{display:"flex",alignItems:"center",gap:9}}><label className="fl" style={{margin:0}}>Populaire</label><label className="tsw"><input type="checkbox" checked={editing.popular} onChange={e=>setEditing({...editing,popular:e.target.checked})}/><span className="tsl"/></label></div>
            <div className="fg" style={{display:"flex",alignItems:"center",gap:9}}><label className="fl" style={{margin:0}}>Disponible</label><label className="tsw"><input type="checkbox" checked={editing.available!==false} onChange={e=>setEditing({...editing,available:e.target.checked})}/><span className="tsl"/></label></div>
          </div>
          <div className="fxa"><button className="gbtn" onClick={()=>setEditing(null)}>Annuler</button><button className="pbtn" onClick={async()=>{const{id,...data}=editing;if(id){await updateProduct(id,data);}else{await addProduct(data);}setEditing(null);toast("OK","Sauvegarde");}}>Sauvegarder</button></div>
        </div></div>}
      </div>)}

      {/* SETTINGS */}
      {adminTab==="settings"&&(<div><div className="ahdr"><h1 className="atit">Réglages</h1></div>
        <div className="setcard"><div className="setlbl">Statut et Temps</div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:18}}>{isOpen?"🟢":"🔴"}</span><span style={{fontSize:14,fontWeight:600}}>{isOpen?"Ouvert":"Fermé"}</span></div>
            <div style={{display:"flex",gap:8}}>
              <label style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"var(--t2)"}}><span>Forcer ouverture</span><label className="tsw"><input type="checkbox" checked={cfg.forceOpen||false} onChange={e=>updateConfig({forceOpen:e.target.checked,forceClose:false})}/><span className="tsl"/></label></label>
              <label style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"var(--t2)"}}><span>Forcer fermeture</span><label className="tsw"><input type="checkbox" checked={cfg.forceClose} onChange={e=>updateConfig({forceClose:e.target.checked,forceOpen:false})}/><span className="tsl"/></label></label>
            </div>
          </div>
          <div className="fr">
            <div className="fg"><label className="fl">Temps attente (min)</label><input className="fi" type="number" min={0} max={120} value={cfg.waitTime} onChange={e=>updateConfig({waitTime:parseInt(e.target.value)||0})}/></div>
            <div className="fg"><label className="fl">Temps retrait (min)</label><input className="fi" type="number" min={0} max={120} value={cfg.pickupTime} onChange={e=>updateConfig({pickupTime:parseInt(e.target.value)||0})}/></div>
          </div>
        </div>
        <div className="setcard"><div className="setlbl">Horaires</div>
          {cfg.hours.map((h,i)=>(
            <div key={h.day} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderBottom:i<6?"1px solid var(--bl)":"none",flexWrap:"wrap"}}>
              <label className="tsw" style={{flexShrink:0}}><input type="checkbox" checked={h.active} onChange={e=>{const nh=[...cfg.hours];nh[i]={...nh[i],active:e.target.checked};updateConfig({hours:nh});}}/><span className="tsl"/></label>
              <span style={{fontSize:12.5,fontWeight:600,width:70,flexShrink:0,opacity:h.active?1:.4}}>{h.day}</span>
              {h.active?(<div style={{display:"flex",gap:4,alignItems:"center",flexWrap:"wrap",flex:1}}>
                <input className="fi" type="time" value={h.open} onChange={e=>{const nh=[...cfg.hours];nh[i]={...nh[i],open:e.target.value};updateConfig({hours:nh});}} style={{width:90,padding:"4px 6px",fontSize:11}}/>
                <span style={{fontSize:10,color:"var(--t3)"}}>-</span>
                <input className="fi" type="time" value={h.close} onChange={e=>{const nh=[...cfg.hours];nh[i]={...nh[i],close:e.target.value};updateConfig({hours:nh});}} style={{width:90,padding:"4px 6px",fontSize:11}}/>
                <span style={{fontSize:10,color:"var(--t4)"}}>&amp;</span>
                <input className="fi" type="time" value={h.open2} onChange={e=>{const nh=[...cfg.hours];nh[i]={...nh[i],open2:e.target.value};updateConfig({hours:nh});}} style={{width:90,padding:"4px 6px",fontSize:11}}/>
                <span style={{fontSize:10,color:"var(--t3)"}}>-</span>
                <input className="fi" type="time" value={h.close2} onChange={e=>{const nh=[...cfg.hours];nh[i]={...nh[i],close2:e.target.value};updateConfig({hours:nh});}} style={{width:90,padding:"4px 6px",fontSize:11}}/>
              </div>):(<span style={{fontSize:11,color:"var(--t4)",fontStyle:"italic"}}>Fermé</span>)}
            </div>
          ))}
        </div>
        <div className="setcard"><div className="setlbl">Plateformes de livraison</div>
          <div className="fg"><label className="fl">Lien Uber Eats</label><input className="fi" value={cfg.uberEatsUrl||""} onChange={e=>updateConfig({uberEatsUrl:e.target.value})} placeholder="https://www.ubereats.com/store/..."/></div>
          <div className="fg"><label className="fl">Lien Deliveroo</label><input className="fi" value={cfg.deliverooUrl||""} onChange={e=>updateConfig({deliverooUrl:e.target.value})} placeholder="https://deliveroo.fr/menu/..."/></div>
        </div>
        <div className="setcard"><div className="setlbl">Message accueil</div>
          {!welcomeEdit?(<>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:10,color:"var(--t3)",marginBottom:2}}>Badge</div><div style={{fontSize:13,marginBottom:8}}>{wlc.badge}</div>
              <div style={{fontSize:10,color:"var(--t3)",marginBottom:2}}>Titre</div><div style={{fontSize:18,fontFamily:"var(--fd)",fontWeight:700,marginBottom:8}}>{wlc.title}</div>
              <div style={{fontSize:10,color:"var(--t3)",marginBottom:2}}>Sous-titre</div><div style={{fontSize:13,color:"var(--t2)"}}>{wlc.subtitle}</div>
            </div>
            <button className="pbtn" style={{padding:"8px 16px"}} onClick={()=>setWelcomeEdit({...wlc})}>Modifier</button>
          </>):(<>
            <div className="fg"><label className="fl">Badge</label><input className="fi" value={welcomeEdit.badge} onChange={e=>setWelcomeEdit({...welcomeEdit,badge:e.target.value})}/></div>
            <div className="fg"><label className="fl">Titre</label><input className="fi" value={welcomeEdit.title} onChange={e=>setWelcomeEdit({...welcomeEdit,title:e.target.value})}/></div>
            <div className="fg"><label className="fl">Sous-titre</label><textarea className="txta" value={welcomeEdit.subtitle} onChange={e=>setWelcomeEdit({...welcomeEdit,subtitle:e.target.value})}/></div>
            <div className="fxa"><button className="gbtn" onClick={()=>setWelcomeEdit(null)}>Annuler</button><button className="pbtn" onClick={()=>{updateConfig({welcome:welcomeEdit});setWelcomeEdit(null);toast("OK","Mis a jour !");}}>Sauvegarder</button></div>
          </>)}
        </div>
      </div>)}
    </main></div></>)}

    {/* ADMIN LOGIN MODAL */}
    {adminLoginModal&&<div className="ov" onClick={()=>setAdminLoginModal(false)}><div className="md" onClick={e=>e.stopPropagation()} style={{maxWidth:380,textAlign:"center"}}>
      <div style={{fontSize:42,marginBottom:10}}>🔐</div>
      <div style={{fontFamily:"var(--fd)",fontSize:20,fontWeight:700,marginBottom:6}}>Espace Administration</div>
      <p style={{fontSize:12.5,color:"var(--t2)",marginBottom:20}}>Connectez-vous pour accéder au panneau</p>
      {adminErr&&<div style={{background:"var(--rds)",color:"var(--rd)",padding:"8px 12px",borderRadius:"var(--rs)",fontSize:12,fontWeight:500,marginBottom:14}}>{adminErr}</div>}
      <div className="fg"><label className="fl">Email</label><input className="fi" type="email" value={adminEmail} onChange={e=>setAdminEmail(e.target.value)} placeholder="admin@poketea.fr"/></div>
      <div className="fg"><label className="fl">Mot de passe</label><input className="fi" type="password" value={adminPw} onChange={e=>setAdminPw(e.target.value)} placeholder="Mot de passe" onKeyDown={async e=>{if(e.key==="Enter"){try{await login(adminEmail,adminPw);setAdminLoginModal(false);setAdminEmail("");setAdminPw("");setAdminErr("");setView("admin");setAdminTab("dashboard");toast("OK","Bienvenue admin !");}catch{setAdminErr("Email ou mot de passe incorrect");}}}}/></div>
      <button className="pbtn" style={{width:"100%",padding:12}} onClick={async()=>{try{await login(adminEmail,adminPw);setAdminLoginModal(false);setAdminEmail("");setAdminPw("");setAdminErr("");setView("admin");setAdminTab("dashboard");toast("OK","Bienvenue admin !");}catch{setAdminErr("Email ou mot de passe incorrect");}}}>Connexion Admin</button>
    </div></div>}

    {/* MODE MODAL */}
    {modeModal&&<div className="ov" onClick={()=>setModeModal(false)}><div className="md" onClick={e=>e.stopPropagation()} style={{maxWidth:440}}>
      <h2 style={{fontFamily:"var(--fd)",fontSize:20,fontWeight:700,textAlign:"center",marginBottom:4}}>Comment souhaitez-vous commander ?</h2>
      {!isOpen&&<div style={{textAlign:"center",background:"var(--rds)",color:"var(--rd)",padding:"8px 14px",borderRadius:"var(--rs)",fontSize:12,fontWeight:600,margin:"10px 0"}}>Le restaurant est actuellement ferme</div>}
      <p style={{fontSize:12.5,color:"var(--t3)",textAlign:"center",marginBottom:20}}>Choisissez votre mode de commande</p>
      <div className="moo">{MODES.map(m=>(<div key={m.id} className="mop" onClick={()=>{setOrderMode(m.id);setModeModal(false);toast(m.icon,"Mode: "+m.label);}}>
        <div style={{width:42,height:42,borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0,background:m.color+"14"}}><span>{m.icon}</span></div>
        <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,marginBottom:1}}>{m.label}</div><div style={{fontSize:11.5,color:"var(--t2)"}}>{m.sub}</div></div>
      </div>))}</div>
      {!isOpen&&<div style={{background:"var(--ys)",color:"var(--yl)",padding:"10px 14px",borderRadius:"var(--rs)",fontSize:12,fontWeight:600,marginTop:12,textAlign:"center"}}>Le restaurant est fermé. Votre commande sera prête 15 min après la prochaine ouverture.</div>}
    </div></div>}

    {/* CART DRAWER */}
    {cartOpen&&<><div className="cov" onClick={()=>setCartOpen(false)}/><div className="cdr">
      <div className="chd"><span className="cht">Mon panier</span><button className="clb" onClick={()=>setCartOpen(false)}>X</button></div>
      {orderMode&&<div className="cmtag"><span>{MODES.find(m=>m.id===orderMode)?.icon}</span>{MODES.find(m=>m.id===orderMode)?.label}</div>}
      <div className="citms">{cart.length===0?<div className="cemp"><div className="ceme">{"🍜"}</div><div>Votre panier est vide</div></div>:cart.map(item=>(
        <div key={item._key} className="citm"><div style={{flex:1}}><div style={{fontSize:12.5,fontWeight:500,marginBottom:2}}>{item.name}</div>{item.selectedOpts&&item.selectedOpts.length>0&&<div style={{fontSize:10,color:"var(--pu)",marginBottom:2}}>+ {item.selectedOpts.map(o=>o.name).join(", ")}</div>}<div style={{fontSize:12.5,color:"var(--ac)",fontWeight:600}}>{(item.unitPrice*item.qty).toFixed(2)}E</div></div>
          <div className="qc"><button className="qb" onClick={()=>{if(item.qty<=1)setCart(cart.filter(i=>i._key!==item._key));else setCart(cart.map(i=>i._key===item._key?{...i,qty:i.qty-1}:i));}}>-</button><span style={{fontSize:12.5,fontWeight:600,minWidth:16,textAlign:"center"}}>{item.qty}</span><button className="qb" onClick={()=>setCart(cart.map(i=>i._key===item._key?{...i,qty:i.qty+1}:i))}>+</button></div>
        </div>))}</div>
      {cart.length>0&&<div className="cft"><div style={{display:"flex",justifyContent:"space-between",marginBottom:12,fontSize:15,fontWeight:700}}><span>Total</span><span style={{color:"var(--ac)"}}>{cartTotal.toFixed(2)}E</span></div>
        {profile&&<div style={{fontSize:11,color:"var(--gr)",marginBottom:10,fontWeight:500}}>+{Math.floor(cartTotal)} points fidelite</div>}
        <button className="ckb" onClick={()=>{setCartOpen(false);setCheckoutOpen(true);}}>Valider - {cartTotal.toFixed(2)}E</button>
      </div>}
    </div></>}

    {/* PRODUCT OPTIONS MODAL */}
    {detailProduct&&<div className="ov" onClick={()=>setDetailProduct(null)}><div className="md" onClick={e=>e.stopPropagation()} style={{maxWidth:440}}>
      {detailProduct.image&&<img style={{width:"100%",height:180,objectFit:"cover",borderRadius:10,marginBottom:10}} src={detailProduct.image} alt={detailProduct.name}/>}
      <h2 className="mt" style={{marginBottom:4}}>{detailProduct.name}</h2>
      <p style={{fontSize:12.5,color:"var(--t2)",marginBottom:14}}>{detailProduct.description}</p>
      <div style={{fontSize:16,fontWeight:800,color:"var(--ac)",marginBottom:14}}>A partir de {detailProduct.price.toFixed(2)}E</div>
      {(detailProduct.optionGroups||[]).map(g=>{const sel=selOpts[g.name]||[];return(
        <div key={g.name} style={{marginBottom:16,paddingBottom:12,borderBottom:"1px solid var(--bl)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:13,fontWeight:600}}>{g.name}</span>
              {g.required&&<span style={{fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:4,background:"var(--rds)",color:"var(--rd)"}}>Obligatoire</span>}
            </div>
            <span style={{fontSize:10,color:"var(--t3)"}}>{g.max===1?"Choisir 1":"Max "+g.max}</span>
          </div>
          <div className="optgrid">{g.options.map(o=>(
            <button key={o.id} className={"optchip "+(sel.includes(o.id)?"sel":"")} onClick={()=>toggleOpt(g.name,o.id,g.max)}>
              {sel.includes(o.id)?"\u2713 ":""}{o.name}{o.price>0&&<span className="optprice">+{o.price.toFixed(1)}E</span>}
            </button>
          ))}</div>
        </div>
      );})}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:14,borderTop:"1px solid var(--bl)"}}>
        <div><div style={{fontSize:10,color:"var(--t3)"}}>Total</div><div style={{fontSize:18,fontWeight:800,color:"var(--ac)"}}>{(detailProduct.price+optsTotal()).toFixed(2)}E</div></div>
        <button className="pbtn" style={{padding:"10px 24px",opacity:canAddToCart()?1:.5,cursor:canAddToCart()?"pointer":"not-allowed"}} onClick={handleAddWithOpts}>Ajouter au panier</button>
      </div>
    </div></div>}

    {/* CHECKOUT */}
    {checkoutOpen&&<CheckoutForm cart={cart} orderMode={orderMode} user={user} profile={profile} cartTotal={cartTotal} waitTime={cfg.waitTime} isOpenNow={isOpen} onClose={()=>setCheckoutOpen(false)} onSubmit={handleSubmit} onSignup={()=>{setCheckoutOpen(false);setAuthModal(true);setAuthTab("register");setAuthErr("");}}/>}

    {/* CONFIRMATION */}
    {confirmation&&<div className="ov" style={{zIndex:400}} onClick={()=>setConfirmation(null)}><div className="md" style={{maxWidth:400,textAlign:"center",padding:36}} onClick={e=>e.stopPropagation()}>
      <div style={{fontSize:52,marginBottom:12}}>{"🎉"}</div>
      <h2 style={{fontFamily:"var(--fd)",fontSize:21,fontWeight:700,marginBottom:5}}>Commande confirmee !</h2>
      <p style={{fontSize:13,color:"var(--t2)",marginBottom:8}}>Merci {confirmation.customer?.name}</p>
      <span style={{fontSize:11.5,color:"var(--t3)",background:"var(--bg)",padding:"5px 13px",borderRadius:7,display:"inline-block",fontWeight:600,marginBottom:12}}>No {confirmation.orderNum}</span>
      {cfg.waitTime>0&&<div style={{background:"var(--ys)",borderRadius:"var(--rs)",padding:"10px 16px",marginBottom:10,fontSize:13,fontWeight:600,color:"var(--yl)"}}>Pret dans ~{cfg.waitTime} min</div>}
      {profile&&<p style={{fontSize:12,color:"var(--gr)",fontWeight:600,marginBottom:8}}>+{Math.floor(confirmation.total)} points ajoutes !</p>}
      <button className="pbtn" style={{padding:"10px 24px"}} onClick={()=>setConfirmation(null)}>Fermer</button>
    </div></div>}

    <div className="tc">{toasts.map(t=><div key={t.id} className="toa"><span>{t.emoji}</span><span>{t.text}</span></div>)}</div>

    {/* MOBILE BOTTOM NAV */}
    {view==="user"&&<div className="bnav">
      <button className={"bnav-i "+(page==="menu"?"a":"")} onClick={()=>setPage("menu")}><span>{"🍽"}</span>Menu</button>
      <button className="bnav-i" onClick={()=>setCartOpen(true)} style={{position:"relative"}}><span>{"🛒"}</span>Panier{cnt>0&&<span className="bnav-badge">{cnt}</span>}</button>
      <button className={"bnav-i "+(page==="loyalty"||page==="account"?"a":"")} onClick={()=>{setPage(user?"account":"loyalty");if(user)setAccTab("loyalty");}}><span>{"⭐"}</span>Fidelite</button>
      <button className={"bnav-i "+(page==="account"?"a":"")} onClick={()=>{if(user){setPage("account");setAccTab("orders");}else{setAuthModal(true);setAuthTab("login");setAuthErr("");}}}><span>{user?"👤":"🔑"}</span>{user?(profile?.name||"Compte").split(" ")[0].substring(0,6):"Compte"}</button>
    </div>}
  </div></>);
}
