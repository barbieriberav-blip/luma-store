import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderS } from './order-s';

describe('OrderS', () => {
  let component: OrderS;
  let fixture: ComponentFixture<OrderS>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderS],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderS);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
